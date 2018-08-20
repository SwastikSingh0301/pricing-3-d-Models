var express                        = require("express");
var app                            = express();
var bodyParser                     = require("body-parser");
var fs                             = require("fs");
var cmd                            = require('node-cmd');
//var StlThumbnailer                 = require('node-stl-thumbnailer');
var fileUpload                     = require("express-fileupload");
var unzip                          = require("unzip-stream");
const methodOverride               = require('method-override');
const editJson                     = require("edit-json-file");
// const path                      = require("path");
// const crypto                    = require('crypto');
const mongoose                     = require('mongoose');
// const multer                    = require('multer');
// const GridFsStorage             = require('multer-gridfs-storage');
// const Grid                      = require('gridfs-stream');
var passport                       = require('passport');
const GoogleStrategy               = require('passport-google-oauth20').Strategy;
const cookieSession                = require("cookie-session");
const Razorpay                     = require('razorpay');
var request                        = require('request');
var nodemailer                     = require("nodemailer");
// var admin                       = require("./config/adminpanel.js");
// var LocalStrategy               = require ("passport-local");
// var passportLocalMongoose       = require("passport-local-mongoose");
// var adminroutes                 = require("./config/adminpanel.js");
//var keys                           = require('./config/keys.js');


// set view engine
app.set('view engine', 'ejs');


// set up session cookies
app.use(cookieSession({
    maxAge: 7 * 24 * 60 * 60 * 1000,
    keys: ['fuckronaldo']
}));


//set-up method-override
app.use(methodOverride('_method'));


//setup body-parser
app.use(bodyParser.urlencoded({extended : true}));


//setup file-upload
app.use(fileUpload());


app.use(express.static("public"));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());


// connect to mongodb database on mlab
mongoose.connect("mongodb://swastik1:swastik1@ds161780.mlab.com:61780/swastik_oauth", function(){
    console.log("connected to mongodb");
});


// defining  user Schema
var userSchema = new mongoose.Schema({
  username           : String,
  googleId           : String,
  emailId            : String,
  photo              : String
});


// defining uploadedfile schema
var uploadSchema = new mongoose.Schema({
    googleId         : String,
    fileName         : String,
    printTime        : String,
    weight           : String,
    price            : String,
    material         : String,
    lh               : String,
    infillDensity    : String,
    infillPercentage : String,
    quantity         : String,
    modweight        : String,
    modtime          : String
});


// defining cart Schema
var cartSchema  = new mongoose.Schema({
    googleId         : String,
    cartFileName     : String,
    price            : String,
    quantity         : String,
    layerHeight      : String,
    infill           : String
});


// defining payments Schema
var paymentSchema = new mongoose.Schema({
    id               : String,
    entity           : String,
    amount           : Number,
    status           : String,
    currency         : String,
    order_id         : String,
    invoice_id       : String,
    international    : Boolean,
    method           : String,
    amount_refunded  : Number,
    refund_status    : String,
    captured         : Boolean,
    description      : String,
    card_id          : String,
    bank             : String,
    wallet           : String,
    vpa              : String,
    email            : String,
    contact          : String,
    notes            : String,
    fee              : Number,
    tax              : Number,
    error_code       : String,
    error_description: String,
    created_at       : Number
});


// defining order Schema
var orderSchema = new mongoose.Schema({
  productname        : String,
  layerheight        : String,
  infill             : String,
  emailId            : String,
  paymentId          : String,
  amount             : String,
  status             : String,
  quantity           : String
});


// adminSchema.plugin(passportLocalMongoose);

// var Admin   = mongoose.model("Admin", adminSchema);


// creating model @ RapidUser
var User    = mongoose.model("User", userSchema);
var Upload  = mongoose.model("Upload", uploadSchema);
var Cart    = mongoose.model("Cart", cartSchema);  
var Payment = mongoose.model("Payment", paymentSchema);
var Order   = mongoose.model("Order", orderSchema);


// app.use(require("express-session")({
//     secret: "Rusty is the best and cutest dog in the world",
//     resave: false,
//     saveUninitialized: false
// }));



// serialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});


// deserialize user
passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});


// passport middleware
passport.use(new GoogleStrategy({
    clientID: '843006764440-oi2bchr14s0dvcdugtdfbfhctmmmkgh6.apps.googleusercontent.com',
    clientSecret: 'VJOBzAzaodOwWlqpDvyH3Qce',
    callbackURL: "https://sadfdf-swastik0310.c9users.io/auth/google/redirect"
  }, (accessToken, refreshToken, profile, done) => {
      //console.log(refreshToken);
        // check if user already exists in our own db
        User.findOne({googleId: profile.id}).then((currentUser) => {
            if(currentUser){
                // already have this user
                //console.log('user is: ', currentUser);
                done(null, currentUser);
            } else {
                //console.log(profile.emails[0].value);
                // if not, create user in our db
                new User({
                    googleId: profile.id,
                    username: profile.displayName,
                    emailId: profile.emails[0].value,
                    photo: profile.photos[0].value,
                }).save().then((newUser) => {
                    //console.log('created new user: ', newUser);
                    done(null, newUser);
                });
            }
        });
    })
);


// passport.use(new LocalStrategy(
// 	function (username, password, done) {
// 		Admin.getUserByUsername(username, function (err, user) {
// 			if (err) throw err;
// 			if (!user) {
// 				return done(null, false, { message: 'Unknown User' });
// 			}

// 			Admin.comparePassword(password, user.password, function (err, isMatch) {
// 				if (err) throw err;
// 				if (isMatch) {
// 					return done(null, user);
// 				} else {
// 					return done(null, false, { message: 'Invalid password' });
// 				}
// 			});
// 		});
// 	}));




var rzp = new Razorpay({
  key_id: 'rzp_test_2ZhVhf0meouzDo',
  key_secret: 'dBKHC7ZWSzapnbS0Sm2kK8vs'
})






// global variable
var sampleFileName;
var fileNameArray=[];


// home page
app.get("/", function (req,res){
   res.render ("index");
});


// hire a designer route
app.get ("/contact-us", function (req, res){
   res.render ("hireDesigner"); 
});

//==============================================================================
//  AUTH ROUTES
//==============================================================================

app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read'] }));



app.get('/auth/google/redirect', passport.authenticate('google'), function(req,res){
    res.redirect("/uploadfile");
});

const authCheck = (req, res, next) => {
    console.log(req.user);
    if(!req.user){
        //console.log(req.user);
        res.redirect('/');
    } else {
        next();
    }
};


//==============================================================================
// UPLOAD FILES ROUTE
//==============================================================================


// upload file get route
app.get("/uploadfile", authCheck, function(req, res) {
    var cartItems = 2;
    Upload.find({googleId: req.user.googleId}, function(err,obj){
        if(err){
            console.log(err);
        }
        else{
            //console.log(obj);
           res.render("new", {obj:obj,cartItems: cartItems});
        }
    });
    // User.find({}, function(err, obj){
    //   if(err){
    //       console.log(err);
    //   } else {
    //         cartItems = obj.length;
    //         Rapid.find({}, function(err, obj){
    //             if(err){
    //               console.log(err);
    //             } else {
    //               res.render("new",{obj:obj,cartItems:cartItems});
    //             }
    //         });
    //     }
    // });
});


//upload STL file post route
app.post('/upload', authCheck, (req, res) => {
    //console.log(req);
    if (!req.files)
        return res.status(400).send('No files were uploaded.');
     
    var sampleFile = req.files.sampleFile;
    sampleFileName = req.files.sampleFile.name;
    console.log(sampleFileName);
    
    sampleFile.mv('public/uploads/'+ sampleFileName, function(err) {
        if (err)
          return res.status(500).send(err);
        if(sampleFile.mimetype ==='application/octet-stream')
        {
            //stltoimg();
            var cmdURL = commandURL();
            var file = editJson("Cura/resources/machines/fdmprinter.json");
            file.get().categories.resolution.settings.layer_height.default = 0.2;
            file.get().categories.infill.settings.infill_sparse_density.children.infill_line_distance.default = 1.1667;
            file.save();
            cmd.get(cmdURL, function (){
                var dataTime = fs.readFileSync("outputTime.txt", "utf8");
                console.log(dataTime);
                var dataWeight = fs.readFileSync("outputWeight.txt", "utf8");
                console.log(dataWeight);
                var weight = Number(dataWeight);
                weight = weight * 1.25 / 1000;
                var finalweight = Math.ceil(weight) + 2;
                var price = finalweight*10 + Number(dataTime)*20 + 100;
                var newRapid = {fileName: sampleFileName, printTime: dataTime, weight: dataWeight};
                // Upload.findOne({googleId : req.user.googleId}, function (err, foundupload){
                //     if(foundupload){
                //         Upload.create({googleId: req.user.googleId, fileName: sampleFileName, printTime: dataTime, weight: dataWeight}, function (err, newupload){
                //             if (err){
                //                 console.log(err);
                //             }
                //         });
                //     }
                //     else{
                        
                //     }
                // })
                   Upload.create({googleId: req.user.googleId, fileName: sampleFileName, printTime: dataTime, weight: dataWeight, price: price, material: "PLA(white)", lh: "0.2", infillDensity: "1.1667", infillPercentage: "30%", quantity: "1"}, function(err, newupload){
                       if(err){
                           console.log (err);
                       }
                       else{
                           //console.log(newupload);
                           res.redirect("/uploadfile");
                       }
                   });

                });
                // User.create(newRapid, function(err, newlyCreated){
                //     if(err){
                //         console.log(err);
                //     }
                //     else {
                //     }
                // });
 
        }
        else if(sampleFile.mimetype ==='application/x-zip-compressed')
        {
            //unzipping
            fs.createReadStream("public/uploads/"+sampleFileName)
            .pipe(unzip.Parse())
            .on('entry', (entry)=> {
                 var filePath = entry.path;
                 var fileType = filePath.slice(-4);
                 var fileName = filePath.slice(6,filePath.length);
                 var type = entry.type; // 'Directory' or 'File'
                 var size = entry.size; // might be undefined in some archives
                 if (fileType === ".stl" || fileType === ".STL") {
                        //console.log("Choco");
                        sampleFileName=fileName;
                        //console.log(sampleFileName);
                        fileNameArray.push(sampleFileName);
                        entry.pipe(fs.createWriteStream("public/uploads/"+fileName));
                  } 
                  else {
                        entry.autodrain();
                  }
            });
            res.redirect("/upload/zip");
        }
        else{
            console.log("Enter .stl file");
            sampleFileName = '';
            res.redirect("/");
        }
    });
});



// upload zip file post route
app.get("/upload/zip", authCheck, function(req, res) {
    //console.log(fileNameArray);
    //console.log(fileNameArray.length);
    if(fileNameArray.length===0)
        res.redirect("/");    
    else
    {
        sampleFileName=fileNameArray.pop();
        stltoimg();
        //console.log("Cura Start");
        var cmdURL = commandURL();
        var file = editJson("Cura/resources/machines/fdmprinter.json");
        file.get().categories.resolution.settings.layer_height.default = 0.2;
        file.get().categories.infill.settings.infill_sparse_density.children.infill_line_distance.default = 1.1667;
        file.save();
        cmd.get(cmdURL, function(err){
        if (!err) {
            //console.log("Cura End");
            var dataTime = fs.readFileSync("outputTime.txt", "utf8");
            var dataWeight = fs.readFileSync("outputWeight.txt", "utf8");
            //console.log(dataTime);
            //console.log(dataWeight);
            var newRapid = {name: sampleFileName, printTime: dataTime, weight: dataWeight};
            Rapid.create(newRapid, function(err, newlyCreated){
                if(err){
                    console.log(err);
                }
                else {
                    res.redirect("/upload/zip");
                }
            });
        } else {
            console.log('error', err);
            }
        });
    }
});












app.get("/mycart", authCheck, function (req, res) {
    //console.log(req.user);
    Cart.find ({googleId: req.user.googleId}, function (err, obj){
        if(err) {
            console.log (err);
        } else {
            var totalprice = 0;
            obj.forEach(function(data){
                totalprice = totalprice + parseInt(data.price);
            });
            console.log(totalprice);
            var additionaldata = {totalp: totalprice, username: req.user.username, email: req.user.emailId, image: req.user.photo}
            res.render ("cart", {obj: obj, additionaldata: additionaldata});
        }
    });
});








app.post("/modify/:id",function(req,res){
    // gfs.files.find().toArray((err, files) => {
    var layerHeight = req.body.height;
    var infill = req.body.infill;
    var name = req.body.fileName;
    //console.log("dsfghfdfdsafds");
    console.log(name);
    console.log(layerHeight);
    console.log(infill);
     //sampleFileName=req.body.fileName[0];
    var cmdURL = modifyCommandURL(name);
     //console.log(sampleFileName[0]);
    //  var createStream = fs.createWriteStream( "findingFanny.txt");
    //       createStream.end();
    //       fs.writeFileSync("findingFanny.txt", req);
    //console.log(layerHeight + "  " + infill);
     
    var file = editJson("Cura/resources/machines/fdmprinter.json");
    file.get().categories.resolution.settings.layer_height.default = layerHeight;
    file.get().categories.infill.settings.infill_sparse_density.children.infill_line_distance.default = infill;
    file.save();
    cmd.get(cmdURL, function (){
        var dataTime = fs.readFileSync("outputTime.txt", "utf8");
        var dataWeight = fs.readFileSync("outputWeight.txt", "utf8");
        console.log(dataTime);
        console.log(dataWeight);
        Upload.findByIdAndUpdate(req.params.id, {printTime: Number(dataTime), weight: Number(dataWeight)}, function(err, updatedRapid){
            if(err){
                console.log(err);
            }
            else{
                //console.log(updatedRapid);
                res.redirect("/uploadfile");
            }
        });
    });
    
});


// post route @add to cart
app.post("/AddToCart/:id", authCheck, function(req,res){
    var Price = req.body.finalPrice;
    console.log(req)
    //console.log(Price);
    var name = req.body.fileName;
    //console.log(name);
    var qnt = Number(req.body.quantity);
    //console.log("quantity",qnt);
    //console.log(req.params);
    var layerheighttocart = req.body.layerheighttocart;
    var infilltocart = req.body.infilltocart;
    var newCart = {name: name, price: Price, quantity: qnt};
    Cart.create({googleId: req.user.googleId, cartFileName: name, price: Price, quantity: qnt, layerHeight : layerheighttocart, infill: infilltocart }, function(err, newlyCreated){
        if(err){
            console.log(err);
        }
        else {
            Upload.findByIdAndRemove(req.params.id, function (err){
            res.redirect("/uploadfile");
            });
        }
    });
});


// delete from uploadfile route
app.get("/delete/:id", authCheck, function(req, res) {
    Upload.findByIdAndRemove(req.params.id, function (err){
        res.redirect("/uploadfile");
    });
});


// delete from cart route
app.get("/deletecart/:id", authCheck, function(req, res) {
    Cart.findByIdAndRemove(req.params.id, function (err){
        res.redirect("/mycart");
    });
});



// payment routes
app.post("/purchase", function (req, res){
    //console.log(req.body.razorpay_payment_id);
    res.redirect("/payment/"+req.body.razorpay_payment_id);
});



app.get("/payment/:id", function (req, res){
    request('https://rzp_test_2ZhVhf0meouzDo:dBKHC7ZWSzapnbS0Sm2kK8vs@api.razorpay.com/v1/payments/'+req.params.id, function (error, response, body) {
        var parsedfile=JSON.parse(body);
        Payment.create(parsedfile, function(err, createdpayment){
            if(err){
                console.log(err);
            }
            
            else{
                Cart.find({googleId: req.user.googleId}, function (err,found){
                    //console.log("FOUNDSOFIFHSUO", found);
                    found.forEach(function(findeach){
                        Order.create({productname: findeach.cartFileName, layerheight: findeach.layerHeight, infill: findeach.infill , emailId: req.user.emailId , paymentId: createdpayment.id, amount: findeach.price, status: parsedfile.status, quantity: findeach.quantity}, function(err, createdorder){
                            if(err){
                                console.log(err);
                            }
                            else {
                                console.log(createdorder);
                            }
                        })
                    });
        
                    found.forEach(function(findeach){
                        Cart.findByIdAndRemove(findeach._id, function(err){
                            if(!err){
                                res.redirect("/mycart");
                            }
                        });
                    });
                });
                        // let transporter = nodemailer.createTransport({
                            // service: 'smtp.gmail.com',
                            // port: 465,
                            // secure: true,
                            //     auth: {
                            //         user: '"Swastik singh" <swastik.singh0301@gmail.com>',
                            //         pass: 'leomessi10'
                            //Order.create({  productname: , layerheight: , infill: , emailId: ,  paymentId: newlyCreated.id, amount:Number(newlyCreated.amount)/100, status: newlyCreated.status})
                //res.redirect("/uploadfile");
            }
                
        });

                // let HelperOptions = {
                //     from: 'swastik.singh0301@gmail.com',
                //     to: 'swastik.singh0301@gmail.com',
                //     subject: 'Hello World',
                //     text: 'i am testing',
                // };
                // transporter.sendMail(HelperOptions, function(err, info){
                //     if(err){
                //         console.log(err);
                //     }
                    // else{
                    //     console.log('mail send');
                    //     console.log(info);
                    //     res.redirect("/uploadfile");
                    // }
    });
                
});


app.get("/iamrapidadmin", function(req, res){
   if (req.user.emailId === "swastik.singh0301@gmail.com"){
        Order.find({}, function(err,obj){
            if(err){
                console.log(err);
            }
            else{
                // var len = obj.length;
                // var lenobj = {length: len};
                // console.log(oobj.reverse());
                var revobj = obj.reverse();
                // res.send("af");
                res.render("adminpanel", {revobj: revobj});
            }
            //res.render("adminpanel");
        });
   }
   else{
       res.redirect("/");
   }
});


app.get("/uploadfile/modify-layer-height/:lh/:infill/:name/:id/:material", function (req, res){
    console.log(req.params.lh);
    console.log(req.params.name);
    console.log(req.params.id);
    var lh = req.params.lh;
    var name = req.params.name;
    var id = req.params.id;
    var infill = req.params.infill;
    console.log(infill);
    console.log(typeof infill);
    var material = req.params.material;
    console.log(material);
    console.log(typeof material);
    var matid = material.slice(0,3);
    var cmdURL = modifyCommandURL(name);
        var file = editJson("Cura/resources/machines/fdmprinter.json");
    file.get().categories.resolution.settings.layer_height.default = Number(lh);
    file.get().categories.infill.settings.infill_sparse_density.children.infill_line_distance.default = Number(infill);
    file.save();
    cmd.get(cmdURL, function (){
        var dataTime = fs.readFileSync("outputTime.txt", "utf8");
        var dataWeight = fs.readFileSync("outputWeight.txt", "utf8");
        console.log(dataTime);
        console.log(dataWeight);
        
        //calculating price of PLA material Rs 10 per gram
        if(matid === "PLA"){
            var weight = Number(dataWeight);
            weight = weight * 1.25 / 1000;
            var finalweight = Math.ceil(weight) + 2;
            var price = finalweight * 10 + dataTime * 20 + 100;
            console.log ("price is !!!!!!!!", price);  
        }
        
        // calculating price of PLA transparent Rs 12 per gram 
        if(matid === "TRA"){
            var weight = Number(dataWeight);
            weight = weight * 1.25 / 1000;
            var finalweight = Math.ceil(weight) + 2;
            var price = finalweight * 12 + dataTime * 20 + 100;
            console.log ("price is !!!!!!!!", price);  
        }
        
        // calculatin price of ABS Rs 12 per gram
        if(matid === "ABS"){
            var weight = Number(dataWeight);
            weight = weight * 1.25 / 1000;
            var finalweight = Math.ceil(weight) + 2;
            var price = finalweight * 12 + dataTime * 20 + 100;
            console.log ("price is !!!!!!!!", price);  
        }
        
        // calculatin price of Flexible material Rs 15 per gram
        if(matid === "FLE"){
            var weight = Number(dataWeight);
            weight = weight * 1.21 / 1000;
            var finalweight = Math.ceil(weight) + 2;
            var price = finalweight * 15 + dataTime * 20 + 100;
            console.log ("price is !!!!!!!!", price);  
        }
        
        // calculatin price of carbon fibre Rs 25 per gram
        if(matid === "CAR"){
            var weight = Number(dataWeight);
            weight = weight * 1.3 / 1000;
            var finalweight = Math.ceil(weight) + 2;
            var price = finalweight * 25 + dataTime * 20 + 100;
            console.log ("price is !!!!!!!!", price);  
        }
        
        // calculatin price of nylon Rs 25per gram
        if(matid === "NYL"){
            var weight = Number(dataWeight);
            weight = weight * 1.1 / 1000;
            var finalweight = Math.ceil(weight) + 2;
            var price = finalweight * 25 + dataTime * 20 + 100;
            console.log ("price is !!!!!!!!", price);  
        }
        Upload.findByIdAndUpdate(req.params.id, {modtime: Number(dataTime), modweight: Number(dataWeight), price: price, lh: lh}, function(err, updatedRapid){
            if(err){
                console.log(err);
                res.render ("somethingwentwrong");
            }
            else{
                //console.log(updatedRapid);
                // res.redirect("/uploadfile");
                var obj = {weight: finalweight, time: dataTime, price: price};
                var api = JSON.stringify(obj);
                res.send(api);
            }
        });
        
        

    });
})





// modify infill route
app.get("/uploadfile/modify-infill-percentage/:infill/:lh/:name/:id/:material", function (req, res){
    // var str = req.params.id;
    // console.log(typeof str);
    // console.log(str);
    // var lh = str.slice(0,3)
    // var name = str.slice(3);
    console.log(req.params.lh);
    console.log(req.params.name);
    console.log(req.params.id);
    var lh = req.params.lh;
    var name = req.params.name;
    var id = req.params.id;
    var infill = req.params.infill;
    if (infill == "1.1667"){
        var infillPer = "30%";
    }
    if (infill == "3.5"){
        var infillPer = "20%";
    }
     if (infill == "7.0"){
        var infillPer = "10%";
    }
    console.log(infill);
    console.log(typeof infill);
    var material = req.params.material;
    console.log(material);
    console.log(typeof material);
    var matid = material.slice(0,3);
    var cmdURL = modifyCommandURL(name);
        var file = editJson("Cura/resources/machines/fdmprinter.json");
    file.get().categories.resolution.settings.layer_height.default = Number(lh);
    file.get().categories.infill.settings.infill_sparse_density.children.infill_line_distance.default = Number(infill);
    file.save();
    cmd.get(cmdURL, function (){
        var dataTime = fs.readFileSync("outputTime.txt", "utf8");
        var dataWeight = fs.readFileSync("outputWeight.txt", "utf8");
        console.log(dataTime);
        console.log(dataWeight);
        
        //calculating price of PLA material Rs 10 per gram
        if(matid === "PLA"){
            var weight = Number(dataWeight);
            weight = weight * 1.25 / 1000;
            var finalweight = Math.ceil(weight) + 2;
            var price = finalweight * 10 + dataTime * 20 + 100;
            console.log ("price is !!!!!!!!", price);  
        }
        
        // calculating price of PLA transparent Rs 12 per gram 
        if(matid === "TRA"){
            var weight = Number(dataWeight);
            weight = weight * 1.25 / 1000;
            var finalweight = Math.ceil(weight) + 2;
            var price = finalweight * 12 + dataTime * 20 + 100;
            console.log ("price is !!!!!!!!", price);  
        }
        
        // calculatin price of ABS Rs 12 per gram
        if(matid === "ABS"){
            var weight = Number(dataWeight);
            weight = weight * 1.25 / 1000;
            var finalweight = Math.ceil(weight) + 2;
            var price = finalweight * 12 + dataTime * 20 + 100;
            console.log ("price is !!!!!!!!", price);  
        }
        
        // calculatin price of Flexible material Rs 15 per gram
        if(matid === "FLE"){
            var weight = Number(dataWeight);
            weight = weight * 1.21 / 1000;
            var finalweight = Math.ceil(weight) + 2;
            var price = finalweight * 15 + dataTime * 20 + 100;
            console.log ("price is !!!!!!!!", price);  
        }
        
        // calculatin price of carbon fibre Rs 25 per gram
        if(matid === "CAR"){
            var weight = Number(dataWeight);
            weight = weight * 1.3 / 1000;
            var finalweight = Math.ceil(weight) + 2;
            var price = finalweight * 25 + dataTime * 20 + 100;
            console.log ("price is !!!!!!!!", price);  
        }
        
        // calculatin price of nylon Rs 25per gram
        if(matid === "NYL"){
            var weight = Number(dataWeight);
            weight = weight * 1.1 / 1000;
            var finalweight = Math.ceil(weight) + 2;
            var price = finalweight * 25 + dataTime * 20 + 100;
            console.log ("price is !!!!!!!!", price);  
        }
        Upload.findByIdAndUpdate(req.params.id, {modtime: Number(dataTime), modweight: Number(dataWeight), price: price, infillDensity: infill, infillPercentage: infillPer}, function(err, updatedRapid){
            if(err){
                console.log(err);
                res.render("somethingwentwrong");
            }
            else{
                //console.log(updatedRapid);
                // res.redirect("/uploadfile");
                var obj = {weight: finalweight, time: dataTime, price: price};
                var api = JSON.stringify(obj);
                res.send(api);
            }
        });
        
        

    });
})




app.get("/uploadfile/change-printer/:id/:printerId", function(req, res){
    var printerId = req.params.printerId;
    
    if(printerId === "2"){ // that is if sla is selected
        Upload.findById(req.params.id, function (err, found){
            if (err){
                console.log (err);
                res.render("somethingwentwrong");
            }
            else{
                var weight = found.weight;
                var printtime = found.printTime;
                var quantity = found.quantity;
                var price =  (Math.ceil(Number(weight) * 0.0012 + 2) * 100) * Number(quantity) + 100;
                Upload.findByIdAndUpdate(req.params.id, {price: price, material: "SRN"}, function (err, updatedmodel){
                    if (err){
                        console.log(err);
                        res.render ("somethingwentwrong");
                    }
                    else {
                        var obj = {price: price};
                        var api = JSON.stringify(obj);
                        res.send(api);
                    }
                    
                })
            }
        });

    }
    if (printerId === "1"){
        Upload.findById(req.params.id, function (err, found){
            if (err){
                console.log (err);
                res.render("somethingwentwrong");
    
            }
            else{
                var weight = found.modweight;
                var printtime = found.modtime;
                var quantity = found.quantity;
                var price = (Math.ceil(Number(weight) * 0.00125 + 2) * 10 + Number(printtime) * 20) * Number(quantity) + 100;
                Upload.findByIdAndUpdate(req.params.id, {price: price, material: "PLA(white)"}, function (err, updatedmodel){
                    if (err){
                        console.log(err);
                        res.render ("somethingwentwrong");
                    }
                    else {
                        var obj = {price: price};
                        var api = JSON.stringify(obj);
                        res.send(api);
                    }
                    
                })
            }
        })
    }
})


app.get("/uploadfile/change-material/:id/:printerId/:material", function (req, res){
    var printerId = req.params.printerId;
    var material  = req.params.material
    var matid     = material.slice(0,3);
    if (printerId === "1"){
        Upload.findById(req.params.id, function(err, found) {
            if (err){
                console.log (err);
                res.render ("somethingwentwrong")
            }
            else{
                if(found.modweight){
                    console.log("mod");
                    var weight = found.modweight;
                    var time = found.modtime;
                    var quantity = found.quantity;
                }
                else{
                    console.log ("asli");
                    var weight = found.weight;
                    var time = found.printTime;
                    var quantity = found.quantity;

                }
                //calculating price of PLA material Rs 10 per gram
                if(matid === "PLA"){
                    var price = (Math.ceil(Number(weight) * 0.00125 + 2) * 10 + Number(time) * 20) * Number(quantity) + 100;
                    console.log ("price is !!!!!!!!", price);  
                }
                
                // calculating price of PLA transparent Rs 12 per gram 
                if(matid === "TRA"){
                    var price = (Math.ceil(Number(weight) * 0.00125 + 2) * 12 + Number(time) * 20) * Number(quantity) + 100;
                    console.log ("price is !!!!!!!!", price);  
                }
                
                // calculatin price of ABS Rs 12 per gram
                if(matid === "ABS"){
                    var price = (Math.ceil(Number(weight) * 0.00125 + 2) * 12 + Number(time) * 20) * Number(quantity) + 100;
                    console.log ("price is !!!!!!!!", price);  
                }
                
                // calculatin price of Flexible material Rs 15 per gram
                if(matid === "FLE"){
                    var price = (Math.ceil(Number(weight) * 0.00121 + 2) * 15 + Number(time) * 20) * Number(quantity) + 100;
                    console.log ("price is !!!!!!!!", price);  
                }
                
                // calculatin price of carbon fibre Rs 25 per gram
                if(matid === "CAR"){
                    var price = (Math.ceil(Number(weight) * 0.0013 + 2) * 25 + Number(time) * 20) * Number(quantity) + 100;
                    console.log ("price is !!!!!!!!", price);  
                }
                
                // calculatin price of nylon Rs 25per gram
                if(matid === "NYL"){
                    var price = (Math.ceil(Number(weight) * 0.0011 + 2) * 25 + Number(time) * 20) * Number(quantity) + 100;
                    console.log ("price is !!!!!!!!", price);  
                }
                Upload.findByIdAndUpdate(req.params.id, {price: price, material: material}, function(err, updatedRapid){
                    if(err){
                        console.log(err);
                        res.render("somethingwentwrong");
                    }
                    else{
                        //console.log(updatedRapid);
                        // res.redirect("/uploadfile");
                        var obj = {price: price};
                        var api = JSON.stringify(obj);
                        res.send(api);
                    }
                }); 
            }
        })

    }
    else{
        Upload.findById(req.params.id, function(err, found){
            if (err){
                console.log (err);
                res.render ("somethingwentwrong")
            }
            else{
                var weight = found.weight;
                var quantity = found.quantity;
                if(matid === "SRN"){
                    var price =  (Math.ceil(Number(weight) * 0.0012 + 2) * 100) * Number(quantity) + 100;
                }
                if (matid === "CRN"){
                    var price =  (Math.ceil(Number(weight) * 0.0012 + 2) * 200) * Number(quantity) + 100;
                }
                Upload.findByIdAndUpdate(req.params.id, {price: price, material: material}, function(err, updatedRapid){
                    if(err){
                        console.log(err);
                        res.render("somethingwentwrong");
                    }
                    else{
                        //console.log(updatedRapid);
                        // res.redirect("/uploadfile");
                        var obj = {price: price};
                        var api = JSON.stringify(obj);
                        res.send(api);
                    }
                });
            }
        })
    }
})



// get route for increase in quantity
app.get("/uploadfile/increase-quantity/:id/:quantity", function (req, res){
    var quantity = req.params.quantity;
    var numq = Number(quantity);
    
    Upload.findById(req.params.id, function (err, found){
        var price = found.price;
        var updateprice = Number(price) / (numq-1)  * Number(quantity);
        updateprice = updateprice.toString();
        Upload.findByIdAndUpdate(req.params.id, {price: updateprice, quantity: quantity}, function (err, updated){
            if(err){
                console.log(err);
                res.render("somethingwentwrong");
            }
            else{
                var obj = {price: updateprice};
                var api = JSON.stringify(obj);
                res.send(api);
            }
        });
    });

});


// get route for decrease in quantity
app.get("/uploadfile/decrease-quantity/:id/:quantity", function (req, res){
    var quantity = req.params.quantity;
    var numq = Number(quantity);
    
    Upload.findById(req.params.id, function (err, found){
        var price = found.price;
        var updateprice = Number(price) / (numq+1)  * Number(quantity);
        updateprice = updateprice.toString();
        Upload.findByIdAndUpdate(req.params.id, {price: updateprice, quantity: quantity}, function (err, updated){
            if(err){
                console.log(err);
                res.render("somethingwentwrong");
            }
            else{
                var obj = {price: updateprice};
                var api = JSON.stringify(obj);
                res.send(api);
            }
        });
    });

});





// app.use(adminroutes);




// app.get("/iamrapid/admin/login", function(req, res){
//   res.render("adminlogin"); 
// });
// //login logic
// //middleware
// app.post("/iamrapid/admin/login", passport.authenticate("local", {
//     successRedirect: "/iamrapid/admin",
//     failureRedirect: "/iamrapid/admin/login"
// }) ,function(req, res){
// });



// app.get("/iamrapid/admin", isLoggedIn, function (req, res){
//   res.render("adminpanel");
// });


// function isLoggedIn(req, res, next){
//     if(req.isAuthenticated()){
//         return next();
//     }
//     res.redirect("/iamrapid/admin/login");
// }







// function to run command in terminal
// function commandURL(){
//     return 'cd CuraEngine && \ ./build/CuraEngine slice -v -j ../Cura/resources/machines/dual_extrusion_printer.json -o "output/test.gcode" -e1 -s infill_line_distance=0 -e0 -l "../public/uploads/' + sampleFileName + '"';
// }

function commandURL(name){
    return 'cd CuraEngine && \ ./build/CuraEngine slice -v -j ../Cura/resources/machines/dual_extrusion_printer.json -o "output/test.gcode" -e1 -s infill_line_distance=0 -e0 -l "../public/uploads/' + sampleFileName + '"';
}


function modifyCommandURL(name){
    return 'cd CuraEngine && \ ./build/CuraEngine slice -v -j ../Cura/resources/machines/dual_extrusion_printer.json -o "output/test.gcode" -e1 -s infill_line_distance=0 -e0 -l "../public/uploads/' + name + '"';
}



// function to upload a JSON file
function uploadJSON(){
    
    var dataTime = fs.readFileSync("outputTime.txt", "utf8");
    var dataWeight = fs.readFileSync("outputWeight.txt", "utf8");    
    fs.readFile('public/uploadFiles.json', 'utf8', function readFileCallback(err, data){
        var obj = JSON.parse(data); //now it an object
        if(sampleFileName)
        {
            if (err){
                console.log(err);
            } else {
                var flag =0;
                obj.users.forEach(function(temp){
                    if(temp.name === sampleFileName)
                    {
                        temp.printTime=dataTime;
                        temp.printWeight=dataWeight;
                        flag=1;
                    }
                });
                if(flag===0)
                {
                    obj.users.push({ "name": sampleFileName , "printTime" : dataTime , "printWeight" : dataWeight}); //add some data
                }
                var json = JSON.stringify(obj); //convert it back to json
                fs.writeFile('public/uploadFiles.json', json, 'utf8'); // write it back 
            }
        }
    }); 
    
}    



// function to get image of stl file
function stltoimg(){
    var thumbnailer = new StlThumbnailer({
        //url: req.query.url,           // url OR filePath must be supplied, but not both
        filePath: "public/uploads/" + sampleFileName,            // load file from filesystem
        requestThumbnails: [
            {
                width: 350,
                height: 350,
            }
        ]   
    })
    .then(function(thumbnails){
          // thumbnails is an array (in matching order to your requests) of Canvas objects
          // you can write them to disk, return them to web users, etc
          thumbnails[0].toBuffer(function(err, buf){      
          //res.contentType('image/png');
          //console.log(typeof buf);
          var createStream = fs.createWriteStream("public/" + sampleFileName + ".jpg");
          createStream.end();
          fs.writeFileSync("public/"+ sampleFileName + ".jpg", buf);
        })
    });
}


app.listen(80,function(){
    console.log("Server is Up..!!"); 
});
