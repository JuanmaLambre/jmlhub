#!/usr/bin/python

# pip install numpy

import math
import numpy as np


DEFAULT_AXIS = 1  # x=0, y=1, z=2

def _rotate(point, angle, axis=DEFAULT_AXIS):
    # Constructing revolution matrix R
    R = [[math.cos(angle), -math.sin(angle)], 
         [math.sin(angle), math.cos(angle)]]
    R = np.insert(R, [axis], [[0],[0]], axis=1)
    R = np.insert(R, [axis], [np.identity(3)[axis]], axis=0)

    return np.dot(point, R)

def _revolution(point, delta, axis=DEFAULT_AXIS):
    res = [point]
    angle = delta
    while angle < 2*math.pi:
        res.append(_rotate(point, angle, axis))
        angle += delta
    return res

def revolve(outline, delta, **opts):
    """ Makes a revolution solid out of 'outline'.
    Returns an ordered list of outlines, each one rotated 'delta' degrees

    outline: list of points
    delta: precision angle for discrete revolution
    opts:
        axis: rotation axis (x=0, y=1, z=2). Defaults DEFAULT_AXIS
        angle: length (in angle) of revolution. Defaults 2*math.pi (minus epsilon)
    """
    axis = opts['axis'] if 'axis' in opts else DEFAULT_AXIS
    angle = opts['angle'] if 'angle' in opts else 2*math.pi-0.001

    res = [outline]
    theta = delta
    while theta <= angle:
        res.append([_rotate(point, theta, axis) for point in outline])
        theta += delta
    return res

def joinIndex(outlines, **opts):
    """ Given an ordered list of outlines (outlines) (with ordered vertex) it returns
    a list of indexes joining the outlines

    opts:
        figure: whether each outline is 2D or not (1D). Defaults True
        closes: whether the last outline joins the first. Defaults True

    Example:
        r = revolve([(1,0,0), (2,0,0)], PI/2)
        index = joinIndex(r)
        index == [ [[0,2,3], [0,1,3]],
                   [[2,4,5], [2,3,5]],
                   ... ]

    TODO: revisar bien la normal de cada triangulo. No da al reves?
    """
    closes = bool(opts['closes']) if 'closes' in opts else True
    figure = bool(opts['figure']) if 'figure' in opts else True

    count = sum(len(o) for o in outlines)
    indexes = []
    outlineLen = len(outlines[0])
    for outline in range(len(outlines)-1*(not closes)):
        for i in range(outlineLen-1):
            """
            (A)_(B)-( ) ...   # outline+1
             |  /|
             | / |
             |/  |
            (p)_(C)-( ) ...   # outline

            """
            p = i + outlineLen*outline
            indexes.append([p, (p+outlineLen+1)%count, (p+outlineLen)%count])   # [p, B, A]
            indexes.append([p, (p+1)%count, (p+outlineLen+1)%count])            # [p, C, B]
        if figure:
            # Last point in outline
            p = (outlineLen-1) + outlineLen*outline
            indexes.append([p, outlineLen*outline, (p+1)%count])
            indexes.append([p, (p+1)%count, (p+outlineLen)%count])
    
    return indexes
        

def outline(f, end, **opts):
    """ Outlines the given function 'f'
    
    f: function to outline
    end: last value
    opts:
        delta: space between evaluations. Defaults (end-init)/50
        init: starting value. Defaults 0
    """
    init = float(opts['init']) if 'init' in opts else 0.0
    delta = float(opts['delta']) if 'delta' in opts else (end-init)/50
    points = []
    x = init
    while x <= end:
        points.append([x, f(x), 0])
        x += delta
    return points





"def cylinder(outline, height):"
    

"def shift"
    
