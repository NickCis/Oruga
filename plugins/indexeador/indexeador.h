#ifndef __INDEXEADOR_H__
#define __INDEXEADOR_H__

#define MAXTHREADS (20)
#define MAXRECURSION (20)
#define MAXDIRLEN (255)
#define ESPERAR (1)

void sighandler(int signal);

typedef struct Indexeando {
	int id;
	pthread_t thread;
	char dir[MAXDIRLEN];
} Indexeando;

typedef struct Hilos {
	struct Hilos *next;
	Indexeando data;
} Hilos;

typedef struct Cola_Hilos {
	Hilos *last;
	Hilos *first;
	int cantidad;
} Cola_Hilos;

void esperar_hilos(void);

Hilos *sacar_primer_hilo(void);
void eliminar_hilo_no_mutex(Hilos *h);
void poner_hilo(Hilos *h);
void limpiar_hilos(void);

void loggear(char *fmt, ...);
void responder(int id, int error, char *error_text, char *fmt, ...);

void *indexar(void *hilo);

#endif

