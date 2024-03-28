let results = []

const setResults = (arr) => {
    results = arr;
}

const clearResults = () => {
    results = []
}

const addResult = (item) => {
    results.push(item)
}

const getResults = () => {
    return results;
}

module.exports = {
    setResults,
    clearResults,
    addResult,
    getResults
}