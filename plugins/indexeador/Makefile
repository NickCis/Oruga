LD=gcc
CC=gcc
LDFLAGS=-lpthread
CFLAGS=-g -Wall

HEADERS=indexeador.h
OBJECTS=indexeador.o

.PHONY: all clean distclean

all: indexeador

indexeador: $(OBJECTS)
	$(LD) $(LDFLAGS) -o "$@" "$<"

clean:
	- $(RM) *~ $(OBJECTS) indexeador

%.o: %.c $(HEADERS)
	$(CC) -c $(CFLAGS) -o "$@" "$<"

