NAME = $(shell npm pkg get name | tr -d '"')
VERSION = $(shell npm pkg get version | tr -d '"')

PKGFILE = $(NAME).kwinscript
PKGDIR = pkg

install: clean

build: cpyconfig

clean:
	rm -r $(PKGDIR)

crtdir:	
	mkdir -p $(PKGDIR)/contents/code
	mkdir $(PKGDIR)/contents/config
	mkdir $(PKGDIR)/contents/ui

cpyconfig: crtdir
	cp -f src/config/metadata.json $(PKGDIR)/	
	sed -i "s/%VERSION%/$(VERSION)/" $(PKGDIR)/metadata.json
	sed -i "s/%NAME%/$(NAME)/" $(PKGDIR)/metadata.json

transpile:
	npm install

cpysrc: crtdir
	
