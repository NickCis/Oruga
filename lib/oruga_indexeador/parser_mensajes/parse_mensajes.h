#ifndef __PARSE_MENSAJES_H__
#define __PARSE_MENSAJES_H__

#define PARSE_MAX_EVENT 255

typedef struct TParserMensaje TParserMensaje;

TParseMensaje* parse_crear(FILE* fd, char *events_def[], unsigned int events_length);
int parse_mensaje(TParseMensaje this, int* id, int* event, char* data, unsigned int data_len);
#endif
