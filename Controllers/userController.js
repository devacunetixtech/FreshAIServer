const userModel = require("../Models/userModel")
//NPM I BCRYPT VALIDATOR JSONWEBTOKEN
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'di8lf7avq',
    api_key: '525722338513788',
    api_secret: '-7k8-J9jx4yLYE0VegSQPN74lB8',
    secure: true
  });

// const imageProcessingLibrary = require('image-processing-library');

const createToken = (_id) =>{
    const jwtkey = process.env.JWT_SECRET_KEY;

    return jwt.sign({ _id }, jwtkey, { expiresIn:"3d" });
};

const registerUser = async  (req, res) => {
    try{
        const {name, email, password} = req.body
        let user  = await userModel.findOne({ email});
        if(user) 
            return res.status(400).json("This User Joined already ....");
        if(!name || !email || !password) 
            return res.status(400).json("All fields are required....")
        if(!validator.isEmail(email)) 
            return res.status(400).json("Email must be a valid email")
        if(!validator.isStrongPassword(password)) 
            return res.status(400).json("Password must be a strong one")
        //SAVING THE USER
        user = new userModel({name, email, password})

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();

        const token = createToken(user._id)
        res.status(200).json({_id:user._id, name, email, token})
    }catch(error){
        console.log(error)
        res.status(500).json(error);
    }
    
};

const loginUser = async  (req, res) => {
    const { email, password} = req.body;
    try{

        let user  = await userModel.findOne({ email });
        if(!user) 
            return res.status(400).json("Invalid email or password..");

        const isValidPassword = await bcrypt.compare(password, user.password);
        if(!isValidPassword) 
            return res.status(400).json("Invalid email or password..");

        const token = createToken(user._id)
        res.status(200).json({_id:user._id, name:user.name, email, token})
    }catch(error){
        console.log(error)
        res.status(500).json(error);
    }
    
};

const findUser = async (req, res) => {
    const userId = req.params.userId;
    try{
        const user = await userModel.findById(userId)
        res.status(200).json(user);
    }catch(error){
        console.log(error)
        res.status(500).json(error);
    }
};

// const imgUpload = (req, res) => {
//     // Upload image to Cloudinary
//     const uploadStream = cloudinary.uploader.upload_stream({ folder: 'uploads' }, (error, result) => {
//       if (error) {
//         return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
//       }
//       const cloudinaryUrl = result.url;
//     //   imgProcess();
//     //   res.json(result);
//       res.json({ cloudinaryUrl });
//       const requestData = {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           data: cloudinaryUrl,
//         }),
//       };
      
//       axios.post('https://www.nyckel.com/v1/functions/7h6uvgo3auk8cjxy/invoke', requestData)
//         .then(response => console.log(response.data))
//         .catch(error => console.error('Error:', error));
//     });
  
//     // Pipe the file buffer to the Cloudinary upload stream
//     uploadStream.end(req.file.buffer);
//   };

const imgUpload = (req, res) => {
    // Check if the request contains a file
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
  
    const image = req.file;
    
    // Upload image to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream({ folder: 'uploads' }, (error, result) => {
      if (error) {
        return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
      }
      const cloudinaryUrl = result.url;
  
      // Cloudinary returns the uploaded image details
      res.json({ cloudinaryUrl });
  
      // Call Nyckel API with JSON content type
      axios.post('https://www.nyckel.com/v1/functions/7h6uvgo3auk8cjxy/invoke', { data: cloudinaryUrl }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => console.log(response.data))
        .catch(error => console.error('Error:', error));
    });
  
    // Pipe the file buffer to the Cloudinary upload stream
    uploadStream.end(image.buffer);
  };
  
module.exports = { registerUser, loginUser, findUser, imgUpload };