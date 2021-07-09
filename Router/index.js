const express=require("express");
let router=express.Router();
const jwt = require('jsonwebtoken')
const verifyToken = require('../middleware/index')
let {validationResult,checkSchema,body}=require("express-validator");
const sequelize = require('../models/index').sequelize;
const initModels = require('../models/init-models')
const models = initModels(sequelize)
var bcrypt = require('bcryptjs');     
const { response } = require("express");
const ImageKit = require('imagekit');

let schema_login=checkSchema({
    email:{isEmail:true,errorMessage:"Please enter valid Email"},
    password: {
        isLength: {
          errorMessage: 'Password should be at least 7 chars long',
          options: { min: 7 },
        },
      },
})
let schema_signup=checkSchema({
    email:{isEmail:true,errorMessage:"Please enter valid Email"},
    phonenumber:{isNumeric: {errorMessage: 'PhoneNumber should be in  Digits ',
        bail: true,
      },isLength: {
        errorMessage: 'PhoneNumber should be at least 7 Digits long',
        options: { min: 10 },
      },errorMessage:"Please enter valid Email"},
    password: {
        isLength: {
          errorMessage: 'Password should be at least 7 chars long',
          options: { min: 7 },
        },
      },
})
let schema_contact=checkSchema({
  name:{isString:true,errorMessage:"name must be characters",
  isLength: {
    errorMessage: 'Name should be at least 4 char long',
    options: { min: 4 },
  }
    },
  email:{isEmail:true,errorMessage:"Please enter valid Email"},
  phonenumber:{isNumeric: {errorMessage: 'PhoneNumber should be in  Digits ',
      bail: true,
    },isLength: {
      errorMessage: 'PhoneNumber should be at least 7 Digits long',
      options: { min: 10 },
    },errorMessage:"Please enter valid Email"},
  message: {
      isLength: {
        errorMessage: 'message  should be at least 7 chars long',
        options: { min: 7 },
      },
    },
})
let schema_profile=checkSchema({
  businessName:{isAlpha:true,
    isLength:{
      errorMessage:"Company name should be in characters",
      options:{min:5}
    },
    },
  address:{isLength:{
        errorMessage: 'Asdress should be at least 40 chars long',
        options: { min: 20 },
      },
    },
  email:{isEmail:true,errorMessage:"Please enter valid Email"},
  phonenumber: {
      isNumeric:{
        errorMessage: 'Number should be at least 10 digits long',
        options: { min: 10 },
      },
    },
    enterName:{isString:true,errorMessage:" name should be in characters"},
    website:{isLength:{
      errorMessage: 'website name should be at least 5 chars long',
      options: { min: 5 },
    },
  },
})

let schema_Addpersondetails=checkSchema(
  
  {
  name:{isAlpha:true,errorMessage:"name must be characters"
    },
  email:{isEmail:true,errorMessage:"Please enter valid Email"},
  phonenumber: {
      isNumeric:{
        errorMessage: 'Number should be at least 10 digits long',
        options: { min: 10 },
      },
    },
  department:{isAlpha:true,errorMessage:"Department must be in characters"
  },  
    website:{isLength:{
      errorMessage: 'website name should be at least 5 chars long',
      options: { min: 5 },
    },
  }
}
)
//Login
router.post("/login",schema_login,async(req,res)=>{
  try{
    let errors = validationResult(req);
    if(errors.isEmpty()) {
      const savedUser = await models.user_login.findOne({where:{user_email:req.body.email}})
      if(savedUser === null){
        const validationResult = {status:'Email ID / Password Invalid',message:[]}
        return res.status(401).send(validationResult);
      }
      else{
        var result = bcrypt.compareSync(req.body.password, savedUser.user_password);
        if(!result){
          const validationResult = {status:'Email ID / Password Invalid',message:[]}
          return res.status(401).send(validationResult);
        }
        else{
          const token = jwt.sign({ user_id: savedUser.user_id }, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'90000000'});
          const validationResult = {status:'Login Successful Redirecting Now!!',message:[{token:token}]}
          res.cookie('token', token, { httpOnly: true , domain:'.netlify.app',secure:true});
          return res.status(200).json(validationResult) 
        }
      }
    }
    else{
        return res.status(422).json({status:'User Registration Failed',message:errors.array()});
    }
  }
  catch(err){
    res.status(500)
  }
})

//Signup
router.post("/signup",schema_signup,async(req,res)=>{
    let errors = validationResult(req);
    if(errors.isEmpty()) {

      const phoneExists = await models.user_login.findOne({where:{user_phone:req.body.phonenumber}})
      if(phoneExists!==null){
        return res.status(422).send({status:'User Registration Failed',status:'Phone Number Already Registered',message:[]});
      }
      const emailExists = await models.user_login.findOne({where:{user_email:req.body.email}})
      if(emailExists!==null){
        return res.status(422).send({status:'User Registration Failed',status:'Email ID Already Registered',message:[]});
      }
      var salt = bcrypt.genSaltSync(10);
      var hashedPassword = bcrypt.hashSync(req.body.password, salt);
      const user = new models.user_login({
        user_email:req.body.email,
        user_password:hashedPassword,
        user_phone:req.body.phonenumber,
        user_status:'unblocked',
      })
      const savedUser = await user.save();
      const userAccess = new models.user_access({
        user_id:savedUser.user_id,
        role_id:'1'
      })
      const savedAccess = await userAccess.save();


      return res.status(200).json({status:'User Registered Successfully',message:req.body});
    }
    else{
        return res.status(422).json({status:'User Registration Failed',message:errors.array()});
    }
})

//Contact
router.post('/contact',schema_contact,async(req,res)=>{
  let errors=validationResult(req);
  console.log(errors)
  if(errors.isEmpty()){
    return res.status(200).json({status:'Message send Sucessfully!!!',color:'danger'})
  }else{
    return res.status(422).json({status:'Message send  UnSucessfully!!!',message:errors.array()});
  }
})

//AddCompany
router.post("/addcompany",verifyToken,async(req,res)=>{
  console.log(req.body)
    let errors=validationResult(req);
      if(errors.isEmpty()){
        try{
          const user=new models.company({
            user_id:res.locals.user_id,
            company_name:req.body.name,
            company_title:req.body.title,
            company_website:req.body.email,
            company_logo:req.body.company_logo
          })
          const newCompany = await user.save();
          return res.status(200).json({status:'Add Successfully',color:'success',message:newCompany.dataValues})
        }
        catch(err){
          return res.status(500).json({status:'unsuccesfully',color:'danger'})
        }
      }else{
        return res.status(422).json({status:'unsuccesfully',color:'danger'})
      }
    
})

//AddBracnch
router.post("/addbranch",verifyToken,async(req,res)=>{
  let errors=validationResult(req);
  console.log(errors)
    if(errors.isEmpty()){
      console.log(req.body[0].company_id)
      try{
        let newData =  req.body.map((element)=>{
          return {...element, user_id:res.locals.user_id}
        })
        models.branch.bulkCreate(newData).then(async(branches,err) => {
          if(err){
            return res.status(500).json({status:'unsuccesfully',color:'danger'})
          }
          else{
            let newBranch = branches.map((element)=>{
              return element.dataValues
            })
            // console.log(newBranch)
            const SavedBranch= await models.branch.findAll({where:{user_id:res.locals.user_id,company_id:req.body[0].company_id}})  
            console.log(SavedBranch)
            return res.status(200).json({status:'Add Successfully',color:'success',message:SavedBranch})
          }
        })
    }
    catch(err){
      console.log(err)
      return res.status(500).json({status:'unsuccesfully',color:'danger'})
    }
    }else{
      return res.status(422).json({status:'unsuccesfully',color:'danger'})
    }
  
})

router.get('/fetchAllCompanyname',verifyToken,async(req,res)=>{
  let errors=validationResult(req);
  if(errors.isEmpty()){
    const savedProfile = await models.company.findAll({
      raw:true,
      where:{user_id:res.locals.user_id},
      include: [
        { model: models.employee, as:'employees' },
        { model: models.branch, as:'branches' }
      ]
    })
    let savedelement=[];
    let newSavedProfile=[];
    savedProfile.forEach(el=>{
      if(!savedelement.includes(el.company_id)){
        newSavedProfile.push(el)
        savedelement.push(el.company_id)
      }
    })
    return res.status(200).json({status:'data fetch done',message:newSavedProfile})
  }else{
    return res.status(422).json({status:'User Registration Failed',message:errors.array()});
  }
})

router.get('/fetchAllCompanyDetails',verifyToken,async(req,res)=>{
  let errors=validationResult(req);
  if(errors.isEmpty()){
    const savedProfile = await models.company.findAll({where:{user_id:res.locals.user_id}})  
    return res.status(200).json({status:'data fetch done',message:savedProfile})
  }else{
    return res.status(422).json({status:'User Registration Failed',message:errors.array()});
  }
})

router.post('/editcompanydetails',verifyToken,async(req,res)=>{
  let errors=validationResult(req);
  console.log(req.body.company_name)
  if(errors.isEmpty()){
    try{
      const savedProfile=await models.company.findOne({where:{user_id:res.locals.user_id,company_id:req.body.company_id}});
      if(savedProfile!==null){
        savedProfile.company_name=req.body.company_name;
        savedProfile.company_title=req.body.company_title;
        savedProfile.company_website=req.body.company_website;
        const newSavedProfile=await savedProfile.save();
        const Companydetails = await models.company.findAll({where:{user_id:res.locals.user_id}})  
        return res.status(200).json({status:'Add Successfully',color:'success',message:Companydetails});
      }
      else{
        return res.status(422).json({status:'unsuccesfully',color:'danger'})
      }
    }
    catch(err){
      return res.status(422).json({status:'unsuccesfully',color:'danger'})
    }
  }else{
    return res.status(422).json({status:'unsuccesfully',color:'danger'});
  }
})


router.get('/fetchAllbranchaddress',verifyToken,async(req,res)=>{
  console.log(req.query.company_id)
  let errors=validationResult(req);
  if(errors.isEmpty()){
    const savedProfile = await models.branch.findAll({where:{user_id:res.locals.user_id,company_id:req.query.company_id}})  
    return res.status(200).json({status:'data fetch done',message:savedProfile})
  }else{
    return res.status(422).json({status:'User Registration Failed',message:errors.array()});
  }
})

router.post('/editbranchaddress',verifyToken,async(req,res)=>{
  let errors=validationResult(req);
  console.log(req.body.company_id)
  if(errors.isEmpty()){
    try{
      const savedProfile=await models.branch.findOne({where:{branch_id : req.body.branch_id }});
      if(savedProfile!==null){
        savedProfile.branch_id=req.body.branch_id;
        savedProfile.user_id=req.body.user_id;
        savedProfile.company_id=req.body.company_id;
        savedProfile.branch_address=req.body.branch_address;
        const newSavedProfile=await savedProfile.save();
        const Branch = await models.branch.findAll({where:{user_id:res.locals.user_id,company_id:req.body.company_id}})  
        return res.status(200).json({status:'Add Successfully',color:'success',message:Branch});
      }
      else{return res.status(422).json({status:'unsuccesfully',color:'danger'})}
      
  }
  catch(err){
    console.log(err)
    return res.status(500).json({status:'unsuccesfully',color:'danger'})
  }
  }else{
    return res.status(422).json({status:'unsuccesfully',color:'danger'})
  }
})

router.post('/delbranch',verifyToken,async(req,res)=>{
  let errors=validationResult(req);
  console.log(req.body)
  console.log(req.query)
  if(errors.isEmpty()){
    try{
      const savedProfile = await models.branch.destroy({where:{user_id:res.locals.user_id,branch_id: req.body.id}}) 
      const newsavedProfile =await models.branch.findAll({where:{user_id:res.locals.user_id,company_id:req.query.company_id}})  
      return res.status(200).json({status:' Branch Deleted succesfully',message:newsavedProfile}) 
    }
    catch(error){
      console.log(error)
    }
    return res.status(200).json({status:'unsuccesfully',message:errors.array()})
  }else{
    return res.status(422).json({status:'Failed to Delete Branch',message:errors.array()});
  }

})

router.get('/fetchAllemployeedetails',verifyToken,async(req,res)=>{
  console.log(req.query.company_id)
  let errors=validationResult(req);
  if(errors.isEmpty()){
    const savedProfile = await models.employee.findAll({where:{user_id:res.locals.user_id,company_id:req.query.company_id}})  
    return res.status(200).json({status:'data fetch done',message:savedProfile})
  }else{
    return res.status(422).json({status:'User Registration Failed',message:errors.array()});
  }
})



//Addemployee
router.post("/Addemployee",verifyToken, 
// [
//   body().isArray(),
//   body('*.name','not be black').notEmpty(),
//   body('*.email','invalid emi=ail').isEmail(),
//   body('*.phonenumber', ' must be a number').isNumeric(),
//   body('*.department','not be black').notEmpty(),
// ]
async(req,res)=>{
  let errors = validationResult(req);
  const rename=req.body.map(e=>{
    return {	
      employee_name:e.name,
      employee_dept:e.department,
      employee_phone:e.phonenumber,
      employee_email:e.email,
      branch_id:e.branch_id,
      company_id:e.company_id
    }
  })
  console.log(rename)
  if(errors.isEmpty()){
    console.log(req.body)
    try{
      let newData = rename.map((element)=>{
        return {...element, user_id:res.locals.user_id}
      })
      console.log(newData);
      models.employee.bulkCreate(newData).then((emp,err) => {
        if(err){
          return res.status(500).json({status:'unsuccesfully',color:'danger'})
        }
        else{
          let newEmp = emp.map((element)=>{
            return element.dataValues
          })
          return res.status(200).json({status:'Add Successfully',color:'success',message:newEmp})
        }
      })
      // return res.status(422).json({status:'unsuccesfully',color:'danger'})
  }
  catch(err){
    return res.status(500).json({status:'unsuccesfully',color:'danger'})
  }
  }else{
    return res.status(422).json({status:'unsuccesfully',color:'danger'})
  }
})

router.post("/Addsingleemployee",verifyToken,async(req,res)=>{
  let errors = validationResult(req);
  const rename=req.body.map(e=>{
    return {	
      employee_name:e.employee_name,
      employee_dept:e.employee_dept,
      employee_phone:e.employee_phone,
      employee_email:e.employee_email,
      branch_id:e.branch_id,
      company_id:e.company_id
    }
  })
  if(errors.isEmpty()){
    try{
      let newData = rename.map((element)=>{
        return {...element, user_id:res.locals.user_id}
      })
      console.log(newData);
      models.employee.bulkCreate(newData).then(async(emp,err) => {
        if(err){
          return res.status(500).json({status:'unsuccesfully',color:'danger'})
        }
        else{
          let newEmp = emp.map((element)=>{
            return element.dataValues
          })
          const SavedEmploye=await models. employee.findAll({where:{user_id:res.locals.user_id,company_id:req.body[0].company_id}})
          return res.status(200).json({status:'Add Successfully',color:'success',message:SavedEmploye})
        }
      })
      // return res.status(422).json({status:'unsuccesfully',color:'danger'})
  }
  catch(err){
    return res.status(500).json({status:'unsuccesfully',color:'danger'})
  }
  }else{
    return res.status(422).json({status:'unsuccesfully',color:'danger'})
  }
})


router.post('/editemployeedetails',verifyToken,async(req,res)=>{
  let errors=validationResult(req);
  console.log(req.body)
  if(errors.isEmpty()){
    try{
      const savedProfile=await models.employee.findOne({where:{user_id:res.locals.user_id,employee_id:req.body.employee_id}});
      console.log(savedProfile)
      if(savedProfile!==null){
        savedProfile.employee_name=req.body.employee_name;
        savedProfile.employee_dept=req.body.employee_dept;
        savedProfile.employee_email=req.body.employee_email;
        savedProfile.employee_phone=req.body.employee_phone;
        savedProfile.branch_id=req.body.branch_id;
        const newSavedProfile=await savedProfile.save();
        const EmployeeDetails = await models.employee.findAll({where:{user_id:res.locals.user_id,company_id:req.query.company_id}})  
        return res.status(200).json({status:'Add Successfully',color:'success',message:EmployeeDetails});
      }
      else{
        return res.status(422).json({status:'unsuccesfully',color:'danger'})
      }
    }
    catch(err){
      return res.status(422).json({status:'unsuccesfully',color:'danger'})
    }
  }else{
    return res.status(422).json({status:'unsuccesfully',color:'danger'});
  }
})


router.post('/delemployeedetails',verifyToken,async(req,res)=>{
  let errors=validationResult(req);
  console.log(req.body)
  if(errors.isEmpty()){
    try{
      const savedProfile = await models.employee.destroy({where:{user_id:res.locals.user_id,employee_id: req.body.id}})
      const newsavedProfile = await models.employee.findAll({where:{user_id:res.locals.user_id,company_id:req.body.company_id}})
      return res.status(200).json({status:'todo deleted succesfully',message:newsavedProfile}) 
    }
    catch(error){
      console.log(error)
    }
    return res.status(200).json({status:'unsuccesfully',message:error.array()})
  }else{
    return res.status(422).json({status:'User Registration Failed',message:errors.array()});
  }

})


router.post("/addmycard",verifyToken,async(req,res)=>{
  let errors=validationResult(req);
    if(errors.isEmpty()){
      try{
        const user=new models.mycards({
          user_id:res.locals.user_id,
          template_id:req.body.template_id,
          company_id:req.body.company_id
        })
        const newCompany = await user.save();
        return res.status(200).json({status:'Add Successfully',color:'success',message:newCompany.dataValues})
      }
      catch(err){
        return res.status(500).json({status:'unsuccesfully',color:'danger'})
      }
    }else{
      return res.status(422).json({status:'unsuccesfully',color:'danger'})
    }
  
})

router.get('/fetchAllmycards',verifyToken,async(req,res)=>{
  let errors=validationResult(req);
  if(errors.isEmpty()){
    const myCardsData = await models.mycards.findAll({
      raw:true,
      include: { model: models.templates, as:'template' },
      where:{user_id:res.locals.user_id}
    })
    return res.status(200).json({status:'data fetch done',message:myCardsData})
  }else{
    return res.status(422).json({status:'User Registration Failed',message:errors.array()});
  }
})

router.get('/image-auth',(req,res)=>{
  const imagekit = new ImageKit({
    urlEndpoint: 'https://ik.imagekit.io/deepraj',
    publicKey: 'public_VTCu/zK1WjPazE7gk/FTltme42c=',
    privateKey: 'private_yxtXnlpwUq4IVlu4r+8+GDaQ7/g='
  });
  var result = imagekit.getAuthenticationParameters();
  res.send(result);
})

//Get all template data
router.get("/fetchAllTemplates",async(req,res)=>{
  try{
    const allTemplates = await models.templates.findAll({
      include: { model: models.template_category, as:'template_category_template_category' }
    })  
    const allCategories = await models.template_category.findAll({})
    res.status(200).json({templates:allTemplates,categories:allCategories})
  }
  catch(err)
  {
    console.log(err)
  }
})

router.post('/deleteTemp',verifyToken,async(req,res)=>{
  console.log(req.body.id)
  let errors=validationResult(req);
    if(errors.isEmpty()){
        try{
          const DeleteCard = await models.mycards.destroy({where:{user_id:res.locals.user_id,mycards_id: req.body.id}})
          return res.status(200).json({status:'data fetch done',message:DeleteCard})
        }
  catch(err){
    console.log(err)
  }}
  else{
    return res.status(500).json({status:'Not Delete Template',message:DeleteCard})
  }
})

router.post('/deletecompany',verifyToken,async(req,res)=>{
  let errors=validationResult(req);
  if(errors.isEmpty()){
    try{
      const DeleteCard = await models.mycards.destroy({where:{user_id:res.locals.user_id,company_id: req.body.id}})
      const savedProfile = await models.company.destroy({where:{user_id:res.locals.user_id,company_id: req.body.id}})
      // const AllCompanyDetails = await models.company.findAll({where:{user_id:res.locals.user_id}})  
      const CompanyDetails = await models.company.findAll({
        raw:true,
        where:{user_id:res.locals.user_id},
        include: [
          { model: models.employee, as:'employees' },
          { model: models.branch, as:'branches' }
        ]
      })
      let savedelement=[];
      let newSavedProfile=[];
      CompanyDetails.forEach(el=>{
        if(!savedelement.includes(el.company_id)){
          newSavedProfile.push(el)
          savedelement.push(el.company_id)
        }
      })
      return res.status(200).json({status:'data fetch done',message:newSavedProfile})
    }
    catch(err){
      console.log(err)
    }
  }else{

  }
})


//Change Password
router.post('/changepassword',verifyToken,async(req,res)=>{
  let errors=validationResult(req);
  console.log(req.body)
  if(errors.isEmpty()){
    try{
      const Userpassword = await models.user_login.findOne({where:{user_id:res.locals.user_id}})
      console.log(Userpassword.dataValues)

      bcrypt.compare(req.body.oldpassword,Userpassword.dataValues.user_password, async(err,result)=> {
        if(result===true){
            if(req.body.newpassword===req.body.confirmpassword){
               try{
                  var salt = bcrypt.genSaltSync(10);
                  var Newpassword = bcrypt.hashSync(req.body.newpassword, salt);
                  models.user_login.findOne({where:{user_id:res.locals.user_id}})
                    .then(record=>{
                      if (!record) {
                        throw new Error('No record found')
                      }
                      else{
                        record.update({user_password:Newpassword})
                      }
                    })
                  return res.status(200).json({status:'Password Reset Successfully!!!',message:req.body});
               } 
               catch(err){
                console.log(err)
               }
            }
            else{
              return res.status(422).json({status:'Confrim password not same to New password!!! ',message:errors.array()});
            }
        }else{
          return res.status(422).json({status:'Old password Entered Wrong!!!',message:errors.array()});
        }
      });
    }
    catch(err){
      console.log(err)
    }
  }else{
    return res.status(422).json({status:'Failed To Change Password!!!',message:errors.array()});
  }
})

//Edit image
router.post('/editimage',verifyToken,async(req,res)=>{
  let errors=validationResult(req);
  console.log(req.body)
  if(errors.isEmpty){
     try{
      const savedProfile=await models.company.findOne({where:{user_id:res.locals.user_id,company_id:req.body.company_id}});
      if(savedProfile!==null){
        savedProfile.company_id=req.body.company_id;
        savedProfile.user_id=req.body.user_id;
        savedProfile.company_name=req.body.company_name;
        savedProfile.company_title=req.body.company_title;
        savedProfile.company_logo=req.body.company_logo;
        savedProfile.company_website=req.body.company_website;
        const newSavedProfile=await savedProfile.save();
        return res.status(200).json({status:'Add Successfully',color:'success'});
      }else{
        return res.status(422).json({status:'unsuccesfully',color:'danger'})
      }
     }catch(err){
       console.log(err)
     }
  }else{

  }
})


//Verify user
router.post("/verify", verifyToken, async(req,res)=>{ 
  res.status(200).json({status:"User Verified Successfully",message:[]})
})

//Verify user
router.post("/logout", async(req,res)=>{
  res
  .status(200)
  .clearCookie('token').json({status:"User Logged Out Successfully",message:[]})
})


module.exports=router;