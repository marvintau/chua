const outer = (listOfLists) => {

  if (listOfLists.some(elem => !Array.isArray(elem))){
    throw Error('outer必须得用在list of lists上')
  }

  if (listOfLists.length === 0){
    return [];
  }

  let [first, ...rest] = listOfLists,
    res = first.map(e => [e]);

  for (let list of rest){
    res = res.map(e => list.map(l => e.concat(l))).flat();
  }

  return res;
}

module.exports = outer;