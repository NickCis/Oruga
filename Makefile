NPM=npm
RM=rm

.PHONY: all clean run

all:
	$(NPM) install

run:
	$(NPM) start

clean:
	- $(RM) -r node_modules *~

