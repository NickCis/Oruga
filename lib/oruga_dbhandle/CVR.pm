
use strict;

package Objdb::CVR::Usuarios;
use base qw(Objdb);

sub new 
{
	my $proto = shift;
	my $self = Objdb::new($proto);

	$self->table('usuarios');
	$self->name($self->table);	

	$self->fields([
		'idusuario',
		'username',
#		'password',
		'email',
		'nombre',
		'apellido'
	]);
	$self->ID_field('idusuario');
 	$self->join('grupos', Objdb::MultipleJoin->new('Objdb::CVR::Usuarios_Grupos', 'idusuario'));
	$self->initialize();

	return $self;
}

sub validateuser
{
	my ($self, $username, $password) = @_;

	$self->where("username='$username' AND password=md5('$password')");
	my $rows = $self->fetchall();
	if (defined $$rows[0])
	{
		return 1;
	}
	else
	{
		$self->initialize();
		return 0;
	}
}

sub setpassword
{
        my ($self, $username, $newpassword) = @_;

        my $query = "UPDATE usuarios set password=md5('".$newpassword."') where username like '".$username."'"; 
        my $sth = $self->db->prepare($query);
        $sth->execute();
}

sub changepassword
{
	my ($self, $username, $oldpassword, $newpassword) = @_;

	my $query = "UPDATE usuarios set password=md5('".$newpassword."') where username like '".$username."' and password=md5('".$oldpassword."')"; 
	my $sth = $self->db->prepare($query);
	$sth->execute();
}

sub checkpermission
{
	my ($self, $permiso) = @_;


	my $id = $self->ID;
	my $query = "SELECT permisos.idpermiso as permiso FROM permisos INNER JOIN grupos_permisos ON grupos_permisos.idpermiso = permisos.idpermiso INNER JOIN usuarios_grupos ON grupos_permisos.idgrupo = usuarios_grupos.idgrupo WHERE usuarios_grupos.idusuario = $id AND permisos.nombre LIKE '$permiso' LIMIT 1";

	my $sth = $self->db->prepare($query);
	$sth->execute();
	if(my $vi = $sth->fetchrow_hashref()) {
		return 1;
	}

	return 0;
}

package Objdb::CVR::Grupos;
use base qw(Objdb);

sub new 
{
	my $proto = shift;
	my $self = Objdb::new($proto);

	$self->table('grupos');
	$self->name($self->table);	

	$self->fields([
			'idgrupo',
			'nombre'
	]);
	$self->ID_field('idgrupo');
	$self->join('permisos', Objdb::MultipleJoin->new('Objdb::CVR::Grupos_Permisos', 'idgrupo'));
	$self->join('usuarios', Objdb::MultipleJoin->new('Objdb::CVR::Usuarios_Grupos', 'idgrupo'));
	$self->initialize();
	
	return $self;
}

package Objdb::CVR::Permisos;
use base qw(Objdb);

sub new 
{
	my $proto 	= shift;
	my $self = Objdb::new($proto);
	
	$self->table('permisos');
	$self->name($self->table());	

	$self->fields([
		'idpermiso',
		'nombre',
		'descripcion'
	]);
	$self->ID_field('idpermiso');
	$self->join('grupos', Objdb::MultipleJoin->new('Objdb::CVR::Grupos_Permisos', 'idpermiso'));
	$self->initialize();
	
	return $self;
}


package Objdb::CVR::Usuarios_Grupos;
use base qw(Objdb);

sub new 
{
	my $proto = shift;
	my $self = Objdb::new($proto);
	
	$self->table('usuarios_grupos');
	$self->name($self->table);	

	$self->fields([
		'id',
		'idusuario',
		'idgrupo'
	]);

	$self->join('usuario', Objdb::ForeignKeys->new('Objdb::CVR::Usuarios', 'idusuario'));
	$self->join('grupo', Objdb::ForeignKeys->new('Objdb::CVR::Grupos', 'idgrupo'));
	$self->initialize();
	
	return $self;
}


package Objdb::CVR::Grupos_Permisos;
use base qw(Objdb);

sub new 
{
	my $proto 	= shift;
	my $self = Objdb::new($proto);

	$self->table('grupos_permisos');
	$self->name($self->table);	

	$self->fields([
		'id',
		'idpermiso',
		'idgrupo'
	]);

	$self->join('permiso', Objdb::ForeignKeys->new('Objdb::CVR::Permisos', 'idpermiso'));
	$self->join('grupo', Objdb::ForeignKeys->new('Objdb::CVR::Grupos', 'idgrupo'));
	$self->initialize();

	return $self;
}
package Objdb::CVR::Artists;
use base qw(Objdb);

sub new 
{
	my $proto = shift;
	my $self  = Objdb::new($proto);

	$self->table('artists');
	$self->name($self->table);	

	$self->fields([
		'id',
		'name'
	]);

	$self->join('albums', Objdb::MultipleJoin->new('Objdb::CVR::Albums', 'idartist'));
	$self->initialize();

	return $self;
}

package Objdb::CVR::Albums;
use base qw(Objdb);

sub new 
{
	my $proto 	= shift;
	my $self = Objdb::new($proto);

	$self->table('albums');
	$self->name($self->table);	

	$self->fields([
		'id',
		'idartist',
		'name',
		'path_img',
		'year'
	]);

	$self->join('artist', Objdb::ForeignKeys->new('Objdb::CVR::Artists', 'idartist'));
	$self->join('songs', Objdb::MultipleJoin->new('Objdb::CVR::Songs', 'idalbum'));
	$self->initialize();

	return $self;
}


package Objdb::CVR::Songs;
use base qw(Objdb);

sub new 
{
	my $proto 	= shift;
	my $self = Objdb::new($proto);

	$self->table('songs');
	$self->name($self->table);	

	$self->fields([
		'id',
		'idalbum',
		'song_nro',
		'name',
		'length',
		'path',
		'status'
	]);

	$self->join('album', Objdb::ForeignKeys->new('Objdb::CVR::Albums', 'idalbum'));

	$self->initialize();

	return $self;
}

1;
