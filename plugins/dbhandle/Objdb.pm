package Objdb;
use strict;
use vars qw($AUTOLOAD);
use Carp;
use Time::Local ();
use Data::Dumper;

sub new 
{
	my $proto = shift;
	my $class = ref($proto) || $proto;
	my $self  = {
		_db			=> undef,
		_table			=> undef,
		_name			=> undef,
		_where			=> undef,
		_order_by		=> undef,
		_group_by		=> undef,
		_limit_from		=> undef,
		_limit_count	=> undef,
		_fields			=> [],
		_query_fields => [], #Fields que se usan en la query, estan lo de los joins, tabla.field
		_last_row => undef, #Guarda la ultima row traida (usada por el iterador)
		_sth => undef, #guarda la instancia de db->prepare (usada por el iterador)
		_id_index => 0, #guarda el indice del id
		_number_own_fields=>0, #Cuenta la cantidad de campos que se traen de la tabla
		_values			=> {},
		_enabled_tables	=> {},
		_disabled_fields=> {},
		_joins			=> {},
		_debug			=> 0,
		_warnings		=> 1,
		_error			=> 0,
		_log			=> undef,
		_ID_field		=> 'id',
		_level			=> 1,
		_nice			=> 1
	};
	bless ($self, $class);
	
	$self->{_name} = $self->{_table};

	return $self;
}

sub AUTOLOAD 
{
	my $self = shift;
	my $type = ref($self) or croak "$self is not an object";
	my $key = $AUTOLOAD;
	$key =~ s/^.*:://;
	
	if (exists $self->{"_$key"}) {
		if ( @_ ) {$self->{"_$key"} = shift;}
		return $self->{"_$key"};
	} elsif (exists $self->{_values}->{$key}) {
		if ( @_ ) {$self->field($key, shift);}
		return $self->field($key);
	} elsif ($key =~ /fetchby_(.*)/ && @_) {
		return $self->fetchby($1, shift, shift);
	}
}

sub initialize 
{
	my $self = shift;
	for (@{$self->{_fields}}) { $self->{_values}->{$_} = ""};
}

sub softReset
{
	my $self = shift;
	foreach my $key (qw(_last_row _sth)){
		$self->{$key} = undef;
	}
}
sub reset
{
	my $self = shift;
	foreach my $key (qw(_where _order_by _group_by _limit_from _limit_count _last_row _sth)){
		$self->{$key} = undef;
	}

	#foreach my $key (qw(_values)){
	#	$self->{$key} = {};
	#}

	foreach my $key (qw(_query_fields)){
		$self->{$key} = [];
	}

	foreach my $key (qw(_id_index)){
		$self->{$key} = 0;
	}
}

sub error
{
	my $self = shift;
	return $self->{_error};
}

sub ID 
{
	my $self = shift;
	if (@_) { $self->field($self->ID_field, shift) }
	return $self->field($self->ID_field);
}

sub field 
{
	my $self 		= shift;
	my $fieldname 	= shift;
	my $value		= shift;
	if (defined $value) { $self->{_values}->{$fieldname} = $value }
	return $self->{_values}->{$fieldname};
}

sub disableTables 
{
	my $self 		= shift;
	my $tables		= shift;
	for (@{$tables}) { delete $self->{_enabled_tables}->{$_}};
}

#** Habilita las tablas de los joins.
# @param $self
# @param $tables (Array) -> nombre de las tablas a habilitar. NOTA: son los nombres de las tablas, no los nombres que se usaron para el contenedor con la funcion join!
#*
sub enableTables 
{
	my $self 		= shift;
	my $tables		= shift;
	for (@{$tables}) { $self->{_enabled_tables}->{$_} = 1};
}

#** Deshabilita campos a traer.
# @param $self
# @param (Array) -> Lista de campos a deshabilitar.
#*
sub disableFields
{
	my $self = shift;
	for (@{(shift)}) { $self->{_disabled_fields}->{$_} = 1};
}

sub enableFields
{
	my $self = shift;
	for (@{(shift)}) { delete $self->{_disabled_fields}->{$_}};
}

#** Agrega un join a la tabla (multiple o foreign key)
# @param $self -> lo pasa el perl
# @param $name (string) -> el nombre que tendra el contenedor dentro de la tabla
# @param $obj (Objdb::Join) [opcional] -> Objeto instanceado de join.
# @return (Objdb::Join) -> Join que esta guardado con el nombre $name
#*
sub join 
{
	my $self 	= shift;
	my $name 	= shift;
	if (@_) 
	{
		my $obj = shift;
		if (ref($obj) eq "Objdb::MultipleJoin" || ref($obj) eq "Objdb::ForeignKeys") 
		{
			$self->{_joins}->{$name} = $obj;
			$obj->nice(0);
			$obj->strict(0);
		}
	}
	return $self->{_joins}->{$name};
}

#** Devuelve una lista de los parametros y los joins que se van a pedir
# @params self
# @return array, ( array of fields, array of joins )
#*
sub makeFieldsList
{
	my $self = shift;
	my $specialName = (@_) ? shift : ($self->name()) ? $self->name(): $self->{_table};
	my $userName = (@_) ? shift : undef;
	my @fields;
	my @joins;
	my @joinsStrict;
	my @where;
	my @order;
	my $multiple = 0;
	my $parameterCounter = 0;
	$self->{_query_fields} = [];
	foreach my $f (@{$self->{_fields}}){
		next if($self->{_disabled_fields} and $self->{_disabled_fields}->{$f});
		push(@fields, $specialName.".".$f);
		push(@{$self->{_query_fields}}, $f);
		$self->{_id_index} = $parameterCounter if($f eq $self->ID_field);
		$parameterCounter++;
	}
	$self->{_number_own_fields} = $parameterCounter;

	push (@where, $self->where) if(defined $self->{_where});
	push (@order, $self->order_by) if(defined $self->{_order_by});
	foreach my $jkey (keys %{$self->{_joins}}){
		next if(!$self->{_enabled_tables}->{$jkey});
		my $j = $self->{_joins}->{$jkey};

		my ($tFields, $tJoins, $tJoinsStrict, $tWhere, $tOrder, $tMultiple) = $j->obj->makeFieldsList($specialName.$jkey, $jkey);
		my $joinStr = ' JOIN ';
		unless($j->strict){
			$joinStr = ' LEFT'.$joinStr;
		}
		$joinStr .= $j->obj->table." as ".$specialName.$jkey." ON ( ";
		if(ref($j) eq "Objdb::MultipleJoin"){
			$multiple = 1;
			$joinStr .= $specialName.'.'.$self->{_ID_field}.'='.$specialName.$jkey.'.'.$j->key." ";
		}else{
			#$joinStr .= $specialName.'.'.$j->key.'='.$specialName.$jkey.'.'.$self->{_ID_field}." ";
			$joinStr .= $specialName.'.'.$j->key.'='.$specialName.$jkey.'.'.$j->obj->{_ID_field}." ";
		}
		if(@{$tWhere}){
			foreach my $wh (@{$tWhere}){
				my $w = $wh;
				$w =~ s/\b$jkey\./$specialName$jkey\./g;
				$joinStr .= " AND ".$w." ";
			}
			$tWhere = [];
		}
		$joinStr .= " )";
		if(@{$tOrder}){
			my $newOrder = [];
			foreach my $or (@{$tOrder}){
				my $orr = $or;
				$orr =~ s/\b$jkey\./$specialName$jkey\./g;
				push @{$newOrder}, $orr;
			}
			$tOrder = $newOrder;
		}
		push(@joins, $joinStr);

		@joinsStrict = (@joinsStrict, @{$tJoinsStrict});
		if($j->strict or $j->order_by){
			push(@joinsStrict, $joinStr);
		}


		if (scalar @{$tFields}){
			push(@{$self->{_query_fields}}, {
					name=>$jkey,
					join=>$j,
					fields=>$j->obj->{_query_fields}
				});
			@fields = (@fields, @{$tFields})
		}
		@joins = ( @joins, @{$tJoins}) if (scalar @{$tJoins});
		@where = (@where, @{$tWhere}) if (scalar @{$tWhere});
		@order = (@order, @{$tOrder}) if (scalar @{$tOrder});
		$multiple = 1 if($tMultiple);
	}
	return (\@fields, \@joins, \@joinsStrict, \@where, \@order, $multiple);
}

#** Arma la sql para hacer la consulta
# @param $self
# @return string -> query de sql
#*
sub makeSelectQuery
{
	my $self = shift;

	my ($fields, $joins, $joinsStrict, $where, $order, $multiple) = $self->makeFieldsList();

	return $self->_makeSelectQuery($fields, $joins, $joinsStrict, $where, $order, $multiple);
}

sub _makeSelectQuery{

	my ($self, $fields, $joins, $joinsStrict, $where, $order, $multiple) = @_;

	my $sql = 'SELECT '.(join(',', @{$fields})). ' FROM '. $self->table ;
	$sql .= ' as '. $self->name if($self->name and $self->table ne $self->name);
	$sql .= ' '.join(' ', @{$joins}) if(scalar @{$joins});

	#FIXME: Puede que llegue a andar mal.
	if((defined $self->{_limit_count} )and $multiple){
		my $limitSql = "SELECT DISTINCT ".$self->table.".".$self->ID_field." FROM ".$self->table." ";
		$limitSql .= ' as '. $self->name if($self->name and $self->table ne $self->name);

		#TODO: buscar solo los joins stricts o los qe tengan un order pertinente.
		#$limitSql .= ' '.join(' ', @{$joins}) if(scalar @{$joins});
		$limitSql .= ' '.join(' ', @{$joinsStrict}) if(scalar @{$joins});
		$limitSql .= ' WHERE '.join(' AND ', @{$where}) if(scalar @{$where});
		$limitSql .= ' ORDER BY '.join(' , ', @{$order}) if(scalar @{$order});
		if(defined $self->{_limit_from} && defined $self->{_limit_count}) {
			$limitSql .= ' LIMIT '.$self->{_limit_from}.','.$self->{_limit_count};
		} elsif (defined $self->{_limit_count}) {
			$limitSql .= ' LIMIT '.$self->{_limit_count};
		}
		$sql .= " JOIN ($limitSql) as temp_limit_table on temp_limit_table.".$self->ID_field."=".$self->table.".".$self->ID_field." ";
	}

	$sql .= ' WHERE '.join(' AND ', @{$where}) if(scalar @{$where});

	$sql .= ' ORDER BY '.join(' , ', @{$order}) if(scalar @{$order});

	if(not $multiple){
		if (defined $self->{_limit_from} && defined $self->{_limit_count}) {
			$sql .= ' LIMIT '.$self->{_limit_from}.','.$self->{_limit_count};
		} elsif (defined $self->{_limit_count}) {
			$sql .= ' LIMIT '.$self->{_limit_count};
		}
	}

	return $sql;
}

#FIXME: Puede que llegue a andar mal.
sub makeCountQuery
{
	my $self = shift;

	my ($fields, $joins, $joinsStrict, $where, $order, $multiple) = $self->makeFieldsList();

	my $sql = "SELECT count(DISTINCT ".$self->table.".".$self->ID_field.") FROM ".$self->table." ";
	$sql .= ' as '. $self->name if($self->name and $self->table ne $self->name);
	$sql .= ' '.join(' ', @{$joinsStrict}) if(scalar @{$joins});
	$sql .= ' WHERE '.join(' AND ', @{$where}) if(scalar @{$where});
	$sql .= ' ORDER BY '.join(' , ', @{$order}) if(scalar @{$order});

	return $sql;
}

#** Metodo iterador, junta las filas de la consulta y devulve cuando halla una.
# @param $self
# @param nice -> hace lindos los valores? (es decir, ejcuta fetch sin pasarle parametro)
# @return hash -> row de sql
sub fetchIter
{
	my $self = shift;
	#my $nice = (scalar @_) ? shift : 1;
	my $nice = (scalar @_) ? shift : $self->nice();
	my %retHash;
	if(!$self->{_sth}){
		my $sql = $self->makeSelectQuery();
		if($self->{_debug}){
			my $log = $self->trace();
			warn "Execute: '$sql' :: Traceback:\n".join("\n\t", @{$log});
		}
		if(!$self->{_db}->ping()) {
			$self->{_error} ++;
			my $log = $self->trace();
			$self->{_log} = "$sql (ping error=$DBI::errstr) :: Traceback\n".join("\n\t", @{$log});
			warn $self->{_log} if($self->{_debug} or $self->warnings);
			return undef;
		}
		$self->{_sth} = $self->db->prepare($sql);
		if(!$self->{_sth}->execute()){
			$self->{_error} ++;
			my $log = $self->trace();
			$self->{_log} = "$sql (execute error=$DBI::errstr) :: Traceback\n".join("\n\t", @{$log});
			warn $self->{_log} if($self->{_debug} or $self->warnings);
			return undef;
		}
		
		$self->{_last_row} = $self->{_sth}->fetchrow_arrayref();
	}
	if(!$self->{_last_row}){
#		$self->reset();
		$self->softReset();
		return undef
	}
	
	my $rowId = $self->{_last_row}->[$self->{_id_index}];
	while($self->{_last_row} and $rowId == $self->{_last_row}->[$self->{_id_index}]){
		my %temp;
		my $index=0;
		$self->propagateJoin(\$index, $self->{_query_fields}, \%retHash, $nice);
		$self->{_last_row} = $self->{_sth}->fetchrow_arrayref();
	}

	$self->{_values} = \%retHash;
	if($nice){
		$self->lastNice();
	}
	return \%retHash;
}

#** Va generando la estructura de joins de manera recursiva
# @param self, instancia de objeto (perl la manda sola)
# @param lastRow, fila de la consulta de mysql
# @param index, int, posicion del lastrow (osea campo) en el qe se encuentra
# @param obj, string o hash, es la estructura del join, o como se llama el campo. { name->, join->, fields-> }
# @param container, Hash donde se agrega la informacion
# @return nuevo index
#*
sub propagateJoin
{
	my $self = shift;
	my $index = shift;
	my $obj = shift;
	my $container = shift;
	my $nice = shift;

	if(ref($obj) eq "HASH"){
		my $thisObj = $obj->{join}->obj;
		$thisObj->{_last_row} = $self->{_last_row};
		my $values = $thisObj->{_values};
		if($self->{_last_row}->[$$index + $thisObj->id_index] != $thisObj->{_values}->{$thisObj->ID_field}){# Cambio el elemento, hay qe nicear
			$thisObj->db($self->db);
			$thisObj->lastNice() if($values->{id} and $nice); #El primero siempre esta en blanco, hay qe saltearlo
			$values = {};
		}
		$thisObj->propagateJoin($index, $obj->{fields}, $values, $nice);
		$thisObj->{_values} = $values;

		if(%{$values}){
			if(ref($obj->{join}) eq "Objdb::MultipleJoin"){
				if(not exists($container->{$obj->{name}})){ # No existe la lista, la creamos y agregamos el primero
					$container->{$obj->{name}} = [];
					if($values->{id} ne '') {
						push @{$container->{$obj->{name}}}, $values;
					}
				} else {
					if($container->{$obj->{name}}->[-1]) {
						if($container->{$obj->{name}}->[-1]->{$thisObj->ID_field} != $values->{$thisObj->ID_field}) {
							foreach (@{$container->{$obj->{name}}}) {
								return $index if($_->{id} == $values->{id});
							}
							push @{$container->{$obj->{name}}}, $values;
						}
					}
				}
			}elsif(ref($obj->{join}) eq "Objdb::ForeignKeys"){
				$container->{$obj->{name}} = $values if(not exists($container->{$obj->{name}}));
			}
		}
	}elsif(ref($obj) eq "ARRAY"){ #Es un array-> son todos los campos a agregar
		foreach my $field (@{$obj}){
			$self->propagateJoin($index, $field, $container, $nice);
		}
	}else{
		#$container->{$campo} = $self->{_last_row}->[$$index++];
		$container->{$obj} = $self->{_last_row}->[$$index] if(defined($self->{_last_row}->[$$index]));
		$$index++;
	}

	return $index;

}
sub propagateJoin_old
{
	my $self = shift;
	my $index = shift;
	my $obj = shift;
	my $container = shift;
	my $nice = shift;

	if(ref($obj) eq "HASH"){
		my $tObj = {};

		$self->propagateJoin($index, $obj->{fields}, $tObj, $nice);
		if(%{$tObj}){
			$obj->{join}->obj->{_values} = $tObj;
			if(ref($obj->{join}) eq "Objdb::MultipleJoin"){
				if(not exists($container->{$obj->{name}})){ # No existe la lista, la creamos y agregamos el primero
					$container->{$obj->{name}} = [];
					push @{$container->{$obj->{name}}}, $tObj;
				}elsif($container->{$obj->{name}}->[-1]->{$obj->{join}->obj->ID_field} != $tObj->{$obj->{join}->obj->ID_field}){
					#Existe la lista, cambio el elemento, niceamos el ultimo, y agregamos uno nuevo
					if($nice){
						$obj->{join}->obj->db($self->db);
						$obj->{join}->obj->{_values} = $container->{$obj->{name}}->[-1];
						$obj->{join}->obj->lastNice();
						$obj->{join}->obj->{_values} = $tObj;
					}
					push @{$container->{$obj->{name}}}, $tObj;
				}
			}elsif(ref($obj->{join}) eq "Objdb::ForeignKeys"){
				$container->{$obj->{name}} = $tObj if(not exists($container->{$obj->{name}}));
			}
		}
	}elsif(ref($obj) eq "ARRAY"){ #Es un array-> son todos los campos a agregar
		foreach my $field (@{$obj}){
			$self->propagateJoin($index, $field, $container, $nice);
		}
	}else{
		#$container->{$campo} = $self->{_last_row}->[$$index++];
		$container->{$obj} = $self->{_last_row}->[$$index] if(defined($self->{_last_row}->[$$index]));
		$$index++;
	}

	return $index;

}
sub lastNice
{
	my $self = shift;
	foreach my $join_name (keys %{$self->{_joins}}){
		next if(!$self->{_enabled_tables}->{$join_name} or !$self->join($join_name)->obj->nice or !%{$self->join($join_name)->obj->values});
		$self->{_joins}->{$join_name}->obj->db($self->db);
		#$self->{_joins}->{$join_name}->obj->fetch();
		$self->{_joins}->{$join_name}->obj->lastNice();
	}
	$self->fetch(undef) if($self->nice());
}


#** Devuelve un trace del error
#@param self -> instancia self
#@param frame -> Cuadro, (0 es la funcion actual, y se suman para ir llegando hasta donde se llamo la funcion)
#*
sub trace {
	my ($self, $frame) = @_;
	$frame = 1 if($frame == undef);
	my @trace;
	while (my ($package, $filename, $line, $sub) = caller($frame++)) {
		if ($package eq 'main') {
			$sub =~ s/main:://;
			push(@trace, "$sub() called from $filename on line $line")
		} else {
			push(@trace, "$package::$sub() called from $filename on line $line");
		}
	}
	@trace = reverse @trace;
	return \@trace;
}

#**************************************
# Methods
#**************************************


sub fetchOne
{
	my $self= shift;
	$self->fetchIter();
	#$self->reset();
	$self->softReset();
	return $self->{_values};
}
sub fetch
{
	my $self= shift;
	my $ID = shift;
	if($ID){
		$self->where(($self->name?$self->name:$self->table).".$self->{_ID_field} = ".($ID));
		$self->fetchIter();
#		$self->reset();
		$self->softReset();
	}
	return $self->{_values};
}

sub fetchby 
{
	my $self = shift;
	my $name = shift;
	my $value= shift;
	my $where= shift;
	my %values;

	$self->{_values} = \%values;

	$self->where($self->table.".$name = '$value'");
	if (defined($where)) { $self->where($self->where." AND $where" );}
	
	$self->limit_count(1);
	#my $result = $self->fetchall();
	#if ($result->[0]) {
		#for (@{$self->{_fields}}) { $values{$_} = $result->[0]->{$_}};
	my $result = $self->fetchIter();
	if ($result) {
		for (@{$self->{_fields}}) { $values{$_} = $result->{$_}};
	} else {
		$self->fetch(0);
	}
#	$self->reset();
	return $self->{_values};
}


sub fetchall 
{
	my $self    = shift;
	my $now     = time();
	my $row;
	my @rows;
	while($row = $self->fetchIter()){
		push(@rows, $row);
	}

	return \@rows;
}

sub count
{
	my $self    = shift;
	my $sql = $self->makeCountQuery();

	if($self->debug){
		my $log = $self->trace();
		warn "count: '$sql' :: Traceback:\n".join("\n\t", @{$log});
	}

	if(!$self->{_db}->ping()) {
		$self->{_error} ++;

		my $log = $self->trace();
		$self->{_log} = "$sql (ping error=$DBI::errstr) :: Traceback\n".join("\n\t", @{$log});
		warn $self->{_log} if($self->{_debug} or $self->warnings);
	}
	my $sth = $self->db->prepare($sql);
	if(!$sth->execute()){
		$self->{_error} ++;

		my $log = $self->trace();
		$self->{_log} = "$sql (execute error=$DBI::errstr) :: Traceback\n".join("\n\t", @{$log});
		warn $self->{_log} if($self->{_debug} or $self->warnings);
	}
	my $row = $sth->fetchrow_arrayref();
	return ($row)? $row->[0]: 0;
}

#*******************************************
# Realiza las altas y modificaciones
#*******************************************
sub store 
{
	my $self = shift;

	my $insert = 1;
	if (defined($self->ID) && $self->ID > 0) { $insert=0; }

	my $first   = 1;
	my $fields  = "";
	my $values  = "";
	my $sql		= "";

	$self->{_error} = 0;
	$self->{_log} = undef;

	if ($insert) {
		$self->ID($self->nextid);
		$fields=" ( ";
		$values=" values ( ";
	}

	for my $key (@{$self->{_fields}}) {
		if (!$first) {
			$fields  .=",";
			$values  .=",";
		} else {
			$first = 0;
		}

		$fields  .= $key;
		if ($insert) {
			$values  .= "'".$self->{_values}->{$key}."'";
		} else {
			$fields  .= "='".$self->{_values}->{$key}."'";
		}
	}

	if ($insert) {
		$fields  .= " ) ";
		$values  .= " ) ";
		$sql      = "INSERT INTO ".$self->{_table}.$fields.$values;

		if(!$self->{_db}->ping()) {
			$self->{_error} ++;
			$self->{_log} = "$sql (ping error)";
		} else {
			if (!$self->{_db}->do($sql)) {
				$self->{_error} ++;
				$self->{_log} = "$sql (Error=$DBI::errstr)";
				warn "$sql (Error=$DBI::errstr)\n"  if ($self->debug);
				return 0; 
			}
			$self->ID($self->lastid());
		}
	} else {
		$sql = "UPDATE ".$self->{_table}." SET ".$fields." WHERE ".$self->ID_field."='".$self->ID."'";
		if (!$self->{_db}->do($sql)) { 
			$self->{_error} ++;
			$self->{_log} = "$sql (Error=$DBI::errstr)";
			warn "$sql (Error=$DBI::errstr)\n"  if ($self->debug);
			return 0; 
		}
	}
	
	return 1;
}

sub delete
{
	my $self= shift;
	my $ID	= shift;

	$self->{_error} = 0;
	$self->{_log} = undef;
	
	foreach my $name (sort(keys %{$self->{_joins}})) 
	{
		my $j = $self->{_joins}->{$name};
		next if (ref($j) ne "Objdb::MultipleJoin");

		my $obj = $j->{_obj} || eval('return '.$j->refclass.'->new();') or die "No instantiate $j->{_refclass}";

		$obj->db($self->db);
		$obj->where($obj->{_table}.".".$j->key."=".$ID);
		for (@{$obj->fetchall()}) { 
			$obj->delete($_->{$obj->ID_field()}); 
			$self->{_error} += $obj->{_error};
			$self->{_log} = $obj->{_log};
		};
	}

		
	if(!$self->{_db}->ping()) {
		$self->{_error} ++;
		$self->{_log} = "ping error";
	} else {
		my $sql	="DELETE FROM ".$self->{_table}." WHERE ".$self->ID_field."='$ID'";
		if (!$self->{_db}->do($sql)) 
		{ 
			$self->{_error} ++;
			$self->{_log} = "$sql (Error=$DBI::errstr)";
			warn "$sql (Error=$DBI::errstr)\n"  if ($self->debug);
			return 0;
		}
	}

	return 1;
}

sub nice_length 
{
	my $self = shift;
	my $length = shift;

	my ($package, $filename, $line) = caller;
	warn "Deprecation warning: '->nice_length' Usar Objdb::CVR::Utils::nice_length Package: '$package' filename: '$filename' on line: '$line'";

	my $sec = int($length % 60);
	my $mins  = int(($length % 3600) / 60);
	my $hours = int($length / 3600);

	my $ret;

	if ($hours == 1) { 
		$ret = '1h'; 
	} elsif ($hours > 0) {
		$ret = $hours.'hs';
	}

	if ($mins > 0) 
	{
		$ret .= ' ' if ($ret);
		$ret .= $mins.'m';
	}

	if ($sec > 0) 
	{
		$ret .= ' ' if ($ret);
		$ret .= $sec.'s';
	}

	return $ret;
}
sub nice_decimal
{
	my $self = shift;
	my $value = shift;
	my $decimal = shift;
	my ($package, $filename, $line) = caller;
	warn "Deprecation warning: '->nice_decimal' Usar Objdb::CVR::Utils::nice_decimal Package: '$package' filename: '$filename' on line: '$line'";
	return sprintf("%.".$decimal."f", $value).' ';
}
sub nice_filesize
{
	my $self = shift;
	my $size = shift;

	my @units = (' B', ' KB', ' MB', ' GB', ' TB');
	my $i;
	for ($i = 0; $size > 1024; $i++) { $size /= 1024; }

	my ($package, $filename, $line) = caller;
	warn "Deprecation warning: '->nice_filesize' Usar Objdb::CVR::Utils::nice_filesize Package: '$package' filename: '$filename' on line: '$line'";
	return sprintf("%.2f", $size).$units[$i];
}

sub unixtime
{
	my $self = shift;
	my $dbtime = shift;

	my ($package, $filename, $line) = caller;
	warn "Deprecation warning: '->unixtime' Usar Objdb::CVR::Utils::unixtime Package: '$package' filename: '$filename' on line: '$line'";

	return 0 if (!defined $dbtime || $dbtime eq '0000-00-00 00:00:00' || $dbtime eq '00000000000000');

	if ($dbtime =~ /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/) {
		return Time::Local::timelocal($6, $5, $4, $3, $2-1, $1-1900);
	} elsif ($dbtime =~ /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/) {
		return Time::Local::timelocal($6, $5, $4, $3, $2-1, $1-1900);
	} else {
		return 0;
	}
}

sub flag
{
	my $self  = shift;
	my $field = shift;
	my $mask  = shift;
	my $oper  = shift;
	my $value = $self->field($field);
	
	if (defined $oper) {
		if(($oper && !($value & $mask)) || (!$oper && ($value & $mask))) {
			$value ^= $mask;
		}
		$self->field($field, $value);
	}
	return ($value & $mask) ? 1 : 0;
}

sub nextid
{
	my $self= shift;
	my $ID  = 0;

	return $ID; # Opcion valida para Mysql, donde el next id se genera por autoincrement.

	my $sql	="SELECT counter FROM sequence WHERE name='".$self->table."'";
	my $sth  = $self->db->prepare($sql);
	if ($sth->execute && (my $row = $sth->fetchrow_hashref())) {
		$ID = $row->{counter} + 1;
		my $sql	="UPDATE sequence SET counter = $ID WHERE name='".$self->table."'";
		if (!$self->db->do($sql)) { 
			warn "$sql (Error=$DBI::errstr)\n"  if ($self->debug);
		}
	} else {
		warn "$sql (Error=$DBI::errstr)\n" if ($self->debug);
	}
	return $ID;
}

sub lastid
{
	my $self= shift;
	my $sth  = $self->db->prepare("SELECT LAST_INSERT_ID() as id");
	$sth->execute;
	my $result = $sth->fetchrow_hashref();
	return $result->{id};
}

sub has_a
{
	my $self  = shift;
	my $name  = shift;
	my $class = shift;
	my $key   = shift;
	$self->join($name, Objdb::ForeignKeys->new($class, $key));
}

sub has_many
{
	my $self  = shift;
	my $name  = shift;
	my $class = shift;
	my $key   = shift;
	my $opts  = shift;
	$self->join($name, Objdb::MultipleJoin->new($class, $key, $opts));
}


package Objdb::Join;
use strict;
use vars qw($AUTOLOAD);
use Carp;

sub new 
{
	my $proto = shift;
	my $class = ref($proto) || $proto;
	
	my $self  = {
		_refclass	=> shift,
		_obj => undef
	};
	bless ($self, $class);
	
	return $self;
}

sub AUTOLOAD 
{
	my $self = shift;
	my $type = ref($self) or croak "$self is not an object";
	my $key = $AUTOLOAD;
	$key =~ s/^.*:://;
	my $_key = '_' . $key;

	if ( @_ ) {
		my $value = shift;
		if(exists {_where=>1,_enableTables=>1,_nice=>1,_disableFields=>1}->{$_key}){
			if($self->{_obj}){
				$self->{_obj}->$key($value);
			}
		}
		$self->{$_key} = $value;
	}
	return $self->{$_key};
}

sub join
{
	my $self 	= shift;
	my $name 	= shift;
	return $self->obj->{_joins}->{$name};
}

sub obj
{
	my $self = shift;
	unless($self->{_obj}){
		$self->{_obj} = eval('return '.$self->refclass.'->new();') or die "No instantiate $self->{_refclass}";
		$self->{_obj}->nice($self->nice) if(defined $self->{_nice});
		$self->{_obj}->where($self->where) if($self->where);
		$self->{_obj}->order_by($self->order_by) if($self->order_by);
		$self->{_obj}->disableFields($self->disableFields) if($self->disableFields);
		$self->{_obj}->enableTables($self->enableTables) if($self->enableTables);
	}
	return $self->{_obj};
}

#ForeignKeys -> Trae un unico elemento
package Objdb::ForeignKeys;
use strict;
use base qw(Objdb::Join);

sub new 
{
	my $proto = shift;
	my $class = ref($proto) || $proto;
	my $self  = $class->SUPER::new(shift);
	$self->key(shift);
	#$self->{_obj} = eval('return '.$self->refclass.'->new();') or die "No instantiate $self->{_refclass}";
	return $self;
}

#MultipleJoin Trae varios elementos
package Objdb::MultipleJoin;
use strict;
use base qw(Objdb::Join);

sub new 
{
	my $proto = shift;
	my $class = ref($proto) || $proto;
	my $self  = $class->SUPER::new(shift);
	my $key   = shift;
	my $opts  = shift;
	
	$self->key($key);
	$self->where($opts->{where}) if(exists $opts->{enableTables});
	#$self->order_by($opts->{order_by});
	#$self->limit_from($opts->{limit_from});
	#$self->limit_count($opts->{limit_count});
	#$self->{_obj} = eval('return '.$self->refclass.'->new();') or die "No instantiate $self->{_refclass}";
	$self->enableTables($opts->{enableTables}) if(exists $opts->{enableTables});
	$self->nice($opts->{nice}) if(exists $opts->{nice});
	$self->disableFields($opts->{disableFields}) if(exists $opts->{disableFields});
	
	return $self;
}

1;
