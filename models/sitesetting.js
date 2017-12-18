module.exports = {
    getStorage: (req, res) => {
        req.webtaskContext.storage.get(function(err, data){
            if(!err){
              return data
            } else {
              throw err;
            }
        });
    },

    saveStorage: (req, res, src, dst) => {
        req.webtaskContext.storage.get(function (err, src) {
            if (err) throw err;
            src = src || dst;
            req.webtaskContext.storage.set(src, function (err) {
                if (err) throw err;
            });
        });
    },
}