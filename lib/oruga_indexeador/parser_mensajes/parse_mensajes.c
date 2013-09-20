#include <stdlib.h>
#include <string.h>

#include "parse_mensaje.h"


struct TParserMensaje {
	FILE* fd;
	unsigned int events_length;
	char *events_def[];
}

TParseMensaje* parse_crear(FILE* fd, char *events_def[], unsigned int events_length){
	TParseMensaje* this = NULL;

	this = (TParseMensaje*) calloc(1, sizeof(struct TParseMensaje));
	this->fd = fd;
	this->events_def = events_def;
	this->events_length = events_length;

	return this;
}

int parse_mensaje(TParseMensaje this, int* id, int* event, char* data, unsigned int data_len){
	char c;
	char msje[PARSE_MAX_EVENT] = {0};
	unsigned int i = 0;

	if(!this || !id || !event)
		return 1;

	*id = 0;
	while( (c = getc(this->fd)) != EOF && c != ':'){
		switch(c){
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
				*id = (*id)*10 + (c- '0');
				break;

			default:
				return 1;
		}
	}

	while( (c = getc(this->fd)) != EOF && c != ':')
		if(i < PARSE_MAX_EVENT-1)
			msje[i++] = c;

	msje[i] = 0;

	*event = -1;
	for(i=0; i < this->events_length){
		if(strcmp(msje, this->events_def[i]) == 0){
			*event = i;
			break;
		}
	}

	i=0;
	while( (c = getc(this->fd)) != EOF && c != '\n'){
		if(i < data_len){
			data[i++] = c;
		}
	}
	return 0;
}
