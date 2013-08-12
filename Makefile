NPM=npm
RM=rm

.PHONY: all run install clean

all: install run

install:
	$(NPM) install

run:
	$(NPM) start

clean:
	- $(RM) -r node_modules *~

