SRC_DIR = src
BUILD_DIR = build
IMAGE_DIR = src/images
GH_PAGES_DIR = ../docs

SPHINX_BUILD = sphinx-build
SPHINX_AUTOBUILD = sphinx-autobuild
SPHINX_OPTS = -d $(BUILD_DIR)/doctrees $(SRC_DIR)

# Main targets -----------------------------------------------------------------

.PHONY: all build clean

all: build

build: html

clean: 
	rm -rf $(BUILD_DIR) $(GH_PAGES_DIR)

# Build specific types of doc---------------------------------------------------

.PHONY: html pdf gh-pages

spelling:
	$(SPHINX_BUILD) -b spelling $(SPHINX_OPTS) $(BUILD_DIR)/spelling

html:
	$(SPHINX_BUILD) -b html $(SPHINX_OPTS) $(BUILD_DIR)/html

pdf:
	$(SPHINX_BUILD) -b latex $(SPHINX_OPTS) $(BUILD_DIR)/pdf
	make -C $(BUILD_DIR)/pdf

gh-pages:
	rm -rf $(GH_PAGES_DIR)
	$(SPHINX_BUILD) -b html $(SPHINX_OPTS) $(GH_PAGES_DIR)

# Sphinx server on localhost ---------------------------------------------------

.PHONY: serve sphinx-autobuild

serve: html
	python serve.py

sphinx-autobuild:
	$(SPHINX_AUTOBUILD) -b html $(SPHINX_OPTS) $(BUILD_DIR)/html
