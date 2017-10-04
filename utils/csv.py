from collections import Counter

""" CSV Database manager
Load a .csv file and start manipulating the data to see some results.
Its kind of a MySQL/Excel for data, without editing it.

Some concepts:
    - db: dict containing the csv file info. Keys:
        - header: ordered array of csv headers
        - size: amount of records
        - data: dict containing the rows. Its keys are each one of the header,
                and the values are an array for the column. Similar to parquet format
    
    - row: dict with column name as key and column value as value
"""

def loadCSV(csvpath, **opts):
    """ Returns a db loaded with the file at csvpath
    opts:
        - limit: max amount of rows to load
        - condition: receives a row and returns True or False
    """
    limit = opts.get('limit', float('infinity'))
    condition = opts.get('condition', lambda r: True)

    content = open(csvpath, 'r').read().splitlines()
    header = content[0].split(',')
    data = {h: [] for h in header}
    count = 0
    for row in content[1:]:
        if (count >= limit): break
        row = row.split(',')
        row = {header[i]: v for i,v in enumerate(row)}
        if condition(row):
            for k, v in row.items():
                data[k].append(v)
            count += 1
    return {'data': data, 'header': header, 'size': count}

def getRow(db, i):
    """ Return i-th row
    """
    return {h: db['data'][h][i] for h in db['data']}

def groupBy(db, column, condition=None):
    """ Return a Counter for each column value (if condition applies)
    The arg condition is a function that receives a dict representing a row and
    returns True or False
    """
    # condition default value could be lambda r: True,
    #   but idk how it could impact in performance
    if (condition):
        return Counter([v for i,v in enumerate(db['data'][column]) if condition(getRow(db, i))])
    else:
        return Counter(db['data'][column])

def sumUp(db, column):
    """ Sums up all the values in the given column (should be casteable to int!)
    """
    return sum(map(lambda x: int(x), db['data'][column]))

def filter(db, filterfun):
    """ DEPRECATED (very low performance) 
    filterfun receives a dict which keys are the deader 
    """
    remove = []
    for i in xrange(db['size']):
        row = {h: db['data'][h][i] for h in db['header']}
        if not filterfun(row): remove.append(i)
    for i in remove:
        for h in db['header']:
            del db['data'][h][i-remove.index(i)]
    db['size'] -= len(remove)

def add(db, name, calcfun):
    """ Adds a column calculated by calcfun
    calcfun receives a dict which keys are the header 
    """
    if name in db['data']: raise "Column "+name+" already in db"

    newData = []
    for i in xrange(db['size']):
        row = {h: db['data'][h][i] for h in db['header']}
        newData.append(calcfun(row))
    db['data'][name] = newData
    db['header'].append(name)
