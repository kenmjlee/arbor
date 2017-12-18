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

    saveStorage: (req, res, data) => {
        req.webtaskContext.storage.set(data, function(err){
            if(err){
                throw err;
            }
        }
    },
}