NAME = $(shell npm pkg get name | tr -d '"')
VERSION = $(shell npm pkg get version | tr -d '"')

PKGFILE = $(NAME).kwinscript
PKGDIR = pkg

all: build

install: clean

build: cpyconfig cpysrc
	zip -r $(PKGFILE) $(PKGDIR)

clean: $(PKGDIR)
	rm -r $(PKGDIR)

cleanpkg: $(PKGFILE)
	rm $(PKGFILE)

crtdir:	
	mkdir -p $(PKGDIR)/contents/code
	mkdir $(PKGDIR)/contents/config
	mkdir $(PKGDIR)/contents/ui

cpyconfig: crtdir
	cp -f src/config/metadata.json $(PKGDIR)/	
	sed -i "s/%VERSION%/$(VERSION)/" $(PKGDIR)/metadata.json
	sed -i "s/%NAME%/$(NAME)/" $(PKGDIR)/metadata.json

buildsrc:
	npm run build

cpysrc: crtdir buildsrc
	cp -f build/reptile.js $(PKGDIR)/contents/code/main.js
