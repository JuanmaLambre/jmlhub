import sys
from collections import Counter
import subprocess as sp
import os


def printil(*texts):
    " Prints inline, without \n "
    sys.stdout.write(' '.join([str(t) for t in texts]))
    sys.stdout.flush()

def rewrite(*texts):
    " Prints given texts on the beginning of current line " 
    sys.stdout.write('\r')
    printil(*texts)

def showProgress(current, everything):
    " Prints % of current relative to everything "
    if 'index' in dir(everything):
        current = everything.index(current) + 1
        everything = len(everything)
    ratio = round(float(current) / float(everything), 4)
    rewrite("{0:.2f}%".format(100*ratio).zfill(6))


def histogram(data, step, **kwargs):
    """ Prints an histogram. Key-word args:
        start: When does the chart begins. Default = 0
        multiplicity: How much each character represents. Default = 1 """
    start = kwargs['start'] if 'start' in kwargs else 0
    multiplicity = kwargs['multiplicity'] if 'multiplicity' in kwargs else 1
    counter = Counter(x // step for x in data)
    distros = [counter[n] for n in range(int(max(data)/step+1))]
    intervals = ['[{},{})'.format(i*step + start, (i+1)*step + start) for i in range(len(distros))]
    maxSpace = len(max(intervals, key=lambda i: len(i)))
    for i, d in enumerate(distros):
        interval = intervals[i]
        print ' '*(maxSpace - len(interval)) + interval + ' ' + '|' * int(round(1.0*d/multiplicity))


def execute(cmd):
    with open(os.devnull, 'w') as devnull:
        commandList = cmd.split() if type(cmd) == str else cmd
        return sp.check_output(commandList, stderr=devnull)
