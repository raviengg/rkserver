module.exports = function(app,app_secure,uuid,hasher){
    app.get('/admin/user/userlist', function(req, res) {
        var db = req.db;
        db.collection('userlist').find().toArray(function (err, items) {
            res.json(items);
        });
    });


    app.get('/admin/user/totaldata', function(req, res) {
        var db = req.db;
        var _id = req.get('_id');

        if(!_id){
            res.send(400,"You don't have access, please create a new user.");
        }

        db.collection('userlist').findOne({'_id':_id},function (err, items){
            if(err === null){
                db.collection('offers').find().toArray(function (err, offerList) {
                    db.collection('events').find().toArray(function (err, eventList) {
                        //res.json({'venue':venueList,'offer':offerList,'event':eventList});
                        var obj = {};
                        var lat = parseFloat(req.get('lat'));
                        var lon = parseFloat(req.get('lon'));
                        if (lon==0 || lat == 0){
                        }else{
                            obj = {'loc':{'$near':{'$geometry':{'type':'Point','coordinates':[lon,lat]}}}};
                        }
                        db.collection('venue').find(obj).toArray(function (err, venueList) {
                                res.json({'venue':venueList,'offer':offerList,'event':eventList});
                        });
                    });
                });
            }else{
                res.send(400,"You don't have access, please create a new user.");
            }
        });
    });

    app.post('/admin/user/add', function(req, res) {
        var db = req.db;
        var user = req.body;
        var getSugar = hasher.md5Hash("vagabond123"+user.imei+"gurgaon");
        console.log(user, " our sugar " + getSugar);
        if(user.sugar == getSugar){
            var lon= parseFloat(user.lon);
            var lat = parseFloat(user.lat);
            delete user['lat'];
            delete user['lon'];
            user._id =  uuid.generate();
            db.collection('userlist').insert(user, function(err, userObj){
                    //(err === null) ? result  : { msg: err }
                if(err === null){
                    db.collection('offers').find().toArray(function (err, offerList) {
                        db.collection('events').find().toArray(function (err, eventList) {
                            //res.json({'venue':venueList,'offer':offerList,'event':eventList});
                            var obj = {};
                            if (lon==0 || lat == 0){
                            }else{
                                obj = {'loc':{'$near':{'$geometry':{'type':'Point','coordinates':[lon,lat]}}}};
                            }

                            db.collection('venue').find(obj).toArray(function (err, venueList) {
                                    var o = {'user_id':userObj[0]._id,'venue':venueList,'offer':offerList,'event':eventList};

                                    res.json(o);
                            });
                        });
                    });
                }else{
                    res.send(err);
                }
            });
        }else{
            res.send(400,"You don't have access to the server");
        }
    });

    /*
     * POST to adduser.
     */
 /*   app.post('/admin/user/adduser', function(req, res) {
        var db = req.db;
        var nUser =  req.body;
        nUser._id =  uuid.v4().replace(/-/g, '');
        db.collection('userlist').insert(nUser, function(err, k){
            console.log(k[0]._id);
            res.send(
                (err === null) ? k[0]  : { msg: err }
            );
        });
    }); */

    /*
     * DELETE to deleteuser.
     */
    app.delete('/admin/user/deleteuser/:id', function(req, res) {
        var db = req.db;
        var userToDelete = req.params.id;
        db.collection('userlist').removeById(userToDelete, function(err, result) {
            res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
        });
    });

}


