#!/usr/bin/python

""" Usage: calc <equation>
If no args received it will read stdin until no input is found
Can use 'ans' variable as last result
"""

import sys


CONSTANT_KEYWORDS = {
    "KB": 1024.0,
    "MB": 1024.0**2,
    "GB": 1024.0**3
}

def replace_constants(equation):
    for kw, const in CONSTANT_KEYWORDS.iteritems():
        equation = equation.replace(kw, str(const))
    return equation

def main():
    if len(sys.argv) > 1:
        print eval(sys.argv[1])
    else:
        equation = raw_input()
        while equation:
            equation = replace_constants(equation)
            ans = eval(equation)
            print ans
            equation = raw_input()
            equation.replace('ans', str(ans))

if __name__ == '__main__':
    main()
