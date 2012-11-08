#!/usr/bin/python
import re
import os
import os.path

def nom(file):
    base = os.path.basename(file)
    dir = os.path.dirname(file)
    with open(os.path.abspath(file), 'r') as f:
        data = f.read()
    data = re.sub('//.*(?=[\n\r])', '', data)
    pat = re.compile('/\*((?!\*\/).)*\*/', re.DOTALL | re.MULTILINE)
    data = re.sub(pat, '', data)
    data = re.sub('\n([\s]*)\n', '\n', data)
    with open(os.path.join(dir, 'nom.' + base), 'w') as f:
        f.write(data)


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Nom all comments and empty lines from a source file.')
    parser.add_argument('file', help='source file to nom')
    args = parser.parse_args()
    nom(args.file)
