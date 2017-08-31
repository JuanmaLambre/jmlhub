#!/usr/bin/python

""" Usage: calc <equation>
If no args received it will read stdin until no input is found
"""

import sys


def main():
    if len(sys.argv) > 1:
        print eval(sys.argv[1])
    else:
        equation = raw_input()
        while equation:
            ans = eval(equation)
            print ans
            equation = raw_input()
            equation.replace('ans', str(ans))

if __name__ == '__main__':
    main()
