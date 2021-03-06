import sys
from collections import Counter
import subprocess as sp
import os



def printil(*texts):
    """ Prints inline, without \\n 
    """
    sys.stdout.write(' '.join([str(t) for t in texts]))
    sys.stdout.flush()

def rewrite(*texts):
    """ Prints given texts on the beginning of current line
    """ 
    sys.stdout.write('\r')
    printil(*texts)

def showProgress(current, everything):
    """ Prints % of current relative to everything
    """
    if 'index' in dir(everything):
        current = everything.index(current) + 1
        everything = len(everything)
    ratio = round(float(current) / float(everything), 4)
    rewrite("{0:.2f}%".format(100*ratio).zfill(6))


def histogram(data, step, **kwargs):
    """ Prints an histogram.

    data: list of floats
    step: interval size
    kwargs:
        start: When does the chart begins. Default = 0
        multiplicity: How much each character represents. Default = 1 
    """
    start = kwargs.get('start', 0)
    multiplicity = kwargs.get('multiplicity', 1)

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


def scatter(points, **opts):
    """ Wrapper for plotting scatter diagrams.
    The idea of this wrapper is to make it very easy and direct to use
    for simple scattering (just call scatter(points) and we will do the rest),
    but flexible for minor adjustments

    points: list of pairs
    opts:
        spec: spec to replace default
        title: title of graph
        size: size of markes
        filename: filename to be saved
    """
    import plotly.offline as py

    # Values calculations
    x, y = zip(*points)
    xlength, ylength = max(x) - min(x), max(y) - min(y)
    xmin, ymin = min(x) - xlength//10 if min(x) < 0 else 0, min(y) - ylength//10 if min(y) < 0 else 0
    xRange, yRange = [(xmin, max(x)+xlength/10.0), (ymin, max(y)+ylength/10.0)]

    specs = opts.get('spec', {
        'data': [
            # Scatter object
            {
                'x': x,
                'y': y,
                'mode': 'markers',
                'marker': {
                    'size': opts.get('size', 4)
                }
            }
        ],
        'layout': {
            # Layout object
            'xaxis': {
                'range': xRange
            },
            'yaxis': {
                'range': yRange
            },
            'title': opts.get('title', None)
        }
    })

    filename = opts.get('filename', 'scatter.html')
    py.plot(specs, filename=filename)



