project = 'ROSMOD GUI'
html_short_title = 'ROSMOD GUI'
#project = 'PNP2'
version = '1.0'
release = '1.0.0'
copyright = '2016, William Emfinger, Pranav Srinivas Kumar'

import os,inspect,sys
sys.path.insert(0, os.path.abspath('.'))

master_doc = 'index'
source_suffix = '.rst'
exclude_patterns = ['**/.#*']
extensions = ['numfig','sphinx.ext.pngmath', 'sphinx.ext.autodoc', 'sphinxcontrib.spelling', 'sphinx.ext.todo']
templates_path = ['_templates']
autoclass_content = "both"
autodoc_member_order = "bysource"

pygments_style = 'sphinx'
import sphinx_rtd_theme
html_theme = 'sphinx_rtd_theme'
html_theme_path = [sphinx_rtd_theme.get_html_theme_path()]
htmlhelp_basename = 'rosmod-gui-doc'
html_static_path = ['_static']
html_context = { 'css_files': ['./_static/custom.css'] }

todo_include_todos = True

add_module_names = False
show_authors = True

spelling_word_list_filename = 'dictionary.txt'

latex_elements = {}
latex_elements['preamble'] = '\usepackage{amsmath}\n\usepackage{amssymb}\n'
latex_elements['classoptions'] = ',openany,oneside'
latex_elements['babel'] = '\\usepackage[english]{babel}'
latex_elements['title'] = 'ROSMOD GUI'
latex_elements['release'] = '1.0.0'
latex_elements['releasename'] = ''
latex_elements['author'] = 'William Emfinger, Pranav Srinivas Kumar'
