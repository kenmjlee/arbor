module.exports = {
    getStorage: (req, res, cb) => {
        req.webtaskContext.storage.get(function(err, data){
            if(!err){
              cb(data);
            } else {
              throw err;
            }
        });
    },

    saveStorage: (req, res, src) => {
        req.webtaskContext.storage.get(function (err, data) {
            if (err) throw err;
            var dst = Object.assign(data, src);
            req.webtaskContext.storage.set(dst, function (err) {
                if (err) throw err;
            });
        });
    },
}