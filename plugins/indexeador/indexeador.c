#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>
#include <sys/types.h>
#include <unistd.h>
#include <pthread.h>
#include <stdarg.h>

#include "indexeador.h"

pthread_mutex_t mutex_hilo = PTHREAD_MUTEX_INITIALIZER;

Cola_Hilos cola_hilos = {.last = 0, .cantidad = 0};

void sighandler(int signal)
{
	loggear("Signal %d", signal);
	switch(signal){
		case SIGINT:
		case SIGTERM:
		case SIGQUIT:
			loggear("Saliendo por interrupcion");
			exit(0);
			break;
		case SIGSEGV:
			loggear("Segmentation fault!");
			abort();
			break;
		default:
			loggear("No se que hacer con la senial %d", signal);
	}
}

int main(int argc, char **argv)
{
	char evento[500], *c, *e, dir[MAXDIRLEN];
	int id;
	Hilos *h = 0;
	pthread_t thread;

	loggear("Iniciando indexador");

	signal(SIGINT, sighandler);
	signal(SIGTERM, sighandler);
	signal(SIGQUIT, sighandler);
	signal(SIGSEGV, sighandler);

	while(1){
		fgets(evento, 500, stdin);
		limpiar_hilos();
		c = strchr(evento, ':');
		e = evento;
		if(!c){
			loggear("No se puede parsear el evento %s", evento);
			responder(-1,"-1");
			continue;
		}
		*c = 0;
		id = atoi(e);
		e = c + 1;
		c = strchr(e, ':');
		if(!c){
			loggear("No se puede parsear el evento %s", evento);
			responder(id, "-1");
			continue;
		}
		*c = 0;
		if(!strcmp(e, "exit")){
			loggear("Se me pidio salir");
			responder(id, "0");
			break;
		}
		else if(!strcmp(e, "indexar")){
			if(cola_hilos.cantidad >= MAXTHREADS){
				loggear("Hay muchos hilos ejecutandose");
				responder(id, "-1");
				continue;
			}
			e = c + 1;
			c = strchr(e, '=');
			if(!c){
				loggear("No se pudo parsear %s", e);
				responder(id, "-1");
				continue;
			}
			*c = 0;
			if(strcmp(e, "carpeta")){
				loggear("Se requiere del argumento carpeta, vino %s", e);
				responder(id, "-1");
				continue;
			}
			strncpy(dir, c + 1, MAXDIRLEN);
			c = strchr(dir, '\n');
			if(c)
				*c = 0;
			h = calloc(1, sizeof(Hilos));
			h->data.id = id;
			strncpy(h->data.dir, dir, MAXDIRLEN);
			pthread_create(&thread, 0, indexar, (void *)h);
			h->data.thread = thread;
			poner_hilo(h);
		}
		else{
			loggear("No se reconoce el evento %s", e);
			responder(id, "-1");
		}
	}

	esperar_hilos();
	loggear("Saliendo normalmente");
	return 0;
}

void *indexar(void *hilo_)
{
	Hilos *hilo = (Hilos *)hilo_;
	if(!hilo)
		return 0;
	loggear("Indexando id %d carpeta %s", hilo->data.id, hilo->data.dir);
	//TODO indexar
	sleep(10);
	loggear("Saliendo id %d", hilo->data.id);
	responder(hilo->data.id, "0");
	return 0;
}

void limpiar_hilos(void)
{
	void *ret;
	Hilos *h = 0;

	pthread_mutex_lock(&mutex_hilo);
	h = cola_hilos.first;
	while(h){
		if(!pthread_tryjoin_np(h->data.thread, &ret)){
			eliminar_hilo_no_mutex(h);
			free(h);
			h = cola_hilos.first;
			continue;
		}
		h = h->next;
	}
	pthread_mutex_unlock(&mutex_hilo);
}

void esperar_hilos(void)
{
	void *ret;
	Hilos *h;
	if(ESPERAR){
		pthread_mutex_lock(&mutex_hilo);
		h = cola_hilos.first;
		while(h){
			pthread_join(h->data.thread, &ret);
			eliminar_hilo_no_mutex(h);
			free(h);
			h = cola_hilos.first;
		}
		pthread_mutex_unlock(&mutex_hilo);
	}
}

void eliminar_hilo_no_mutex(Hilos *h)
{
	Hilos *c, *u = 0;
	if(!h)
		return;

	c = cola_hilos.first;
	while(c){
		if(c == h){
			if(!u)
				cola_hilos.first = c->next;
			else
				u->next = c->next;
			cola_hilos.cantidad--;
			break;
		}
		c = c->next;
		u = c;
	}
}

Hilos *sacar_primer_hilo(void)
{
	Hilos *h = 0;
	pthread_mutex_lock(&mutex_hilo);

	if(cola_hilos.first){
		h = cola_hilos.first;
		cola_hilos.first = h->next;
		cola_hilos.cantidad--;
	}

	pthread_mutex_unlock(&mutex_hilo);
	return h;
}

void poner_hilo(Hilos *h)
{
	if(!h)
		return;
	pthread_mutex_lock(&mutex_hilo);

	h->next = 0;
	if(!cola_hilos.last || !cola_hilos.first)
		cola_hilos.first = h;
	else
		cola_hilos.last->next = h;
	cola_hilos.last = h;
	cola_hilos.cantidad++;

	pthread_mutex_unlock(&mutex_hilo);
}

void loggear(char *fmt, ...)
{
	va_list ap;
	char texto[300];
	va_start(ap, fmt);
	sprintf(texto, "%d:%s\n", getpid(), fmt);
	vfprintf(stderr, texto, ap);
	va_end(ap);
}

void responder(int id, char *fmt, ...)
{
	va_list ap;
	char texto[300];
	va_start(ap, fmt);
	sprintf(texto, "%d:%s\n", id, fmt);
	vprintf(texto, ap);
	va_end(ap);
}

