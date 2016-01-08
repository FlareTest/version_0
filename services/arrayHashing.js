module.exports = {
    getHash: function(val) {
        var stringVal = JSON.stringify(val);
        var valHash = 0;
        for (var i = 0; i < stringVal.length; i++) {
            valHash = (valHash * 257 + stringVal.charCodeAt(i)) % 1000003;
        }
        return valHash;
    }
};