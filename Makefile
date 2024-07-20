NAME = $(shell npm pkg get name | tr -d '"')
VERSION = $(shell npm pkg get version | tr -d '"')

PKGFILE = $(NAME).kwinscript
PKGDIR = pkg

all: build install clean

install: installscript installicons

build: buildscript buildicons

clean: cleanscript cleanicons

cleanscript: cleanpkg cleandir

cleandir: $(PKGDIR)
	rm -r $(PKGDIR)

cleanpkg: $(PKGFILE)
	rm $(PKGFILE)

cleanicons:
	sh scripts/clean.sh

crtdir:	
	mkdir -p $(PKGDIR)/contents/code
	mkdir $(PKGDIR)/contents/config
	mkdir $(PKGDIR)/contents/ui

cpyconfig:
	cp -f src/config/metadata.json $(PKGDIR)/
	sed -i "s/%VERSION%/$(VERSION)/" $(PKGDIR)/metadata.json
	sed -i "s/%NAME%/$(NAME)/" $(PKGDIR)/metadata.json
	cp -f src/config/main.xml $(PKGDIR)/contents/config/
	cp -f src/config/config.ui $(PKGDIR)/contents/ui/

cpysrc: buildsrc
	cp -f build/reptile.js $(PKGDIR)/contents/code/main.js

buildscript: crtdir cpyconfig cpysrc
	zip -r $(PKGFILE) $(PKGDIR)

buildsrc:
	npm run build

buildicons:
	sh scripts/build.sh

installicons:
	sh scripts/install.sh

installscript: $(PKGFILE)
	kpackagetool6 -t KWin/Script -s $(NAME) \
                && kpackagetool6 -t KWin/Script -u $(PKGFILE) \
                || kpackagetool6 -t KWin/Script -i $(PKGFILE)
	
uninstallicons:
	sh scripts/uninstall.sh