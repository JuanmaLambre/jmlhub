from collections import Counter


def loadCSV(csvpath, **opts):
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

def groupBy(db, column):
    return Counter(db['data'][column])

def sumBy(db, column):
    return sum(map(lambda x: int(x), db['data'][column]))

def filter(db, filterfun):
    """ filterfun receives a dict which keys are the deader """
    remove = []
    for i in xrange(db['size']):
        row = {h: db['data'][h][i] for h in db['header']}
        if not filterfun(row): remove.append(i)
    for i in remove:
        for h in db['header']:
            del db['data'][h][i-remove.index(i)]
    db['size'] -= len(remove)

def add(db, name, calcfun):
    """ calcfun receives a dict which keys are the header """
    if name in db['data']: raise "Column "+name+" already in db"

    newData = []
    for i in xrange(db['size']):
        row = {h: db['data'][h][i] for h in db['header']}
        newData.append(calcfun(row))
    db['data'][name] = newData
    db['header'].append(name)
