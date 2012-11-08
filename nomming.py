#!/usr/bin/python
import re
import os
import os.path

def nom(file):
    base = os.path.basename(file)
    dir = os.path.dirname(file)
    file = open(os.path.abspath(file), 'r')
    data = file.read()
    data = re.sub('//.*(?=[\n\r])', '', data)
    pat = re.compile('/\*((?!\*\/).)*\*/', re.DOTALL | re.MULTILINE)
    data = re.sub(pat, '', data)
    data = re.sub('\n([\s]*)\n', '\n', data)
    save = open(os.path.join(dir, 'nom.' + base), 'w')
    save.write(data)
    save.close()


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Nom all comments and empty lines from a source file.')
    parser.add_argument('file', help='source file to nom')
    args = parser.parse_args()
    nom(args.file)
