//company routes

const express = require('express');
const router = express.Router()
const db = require('../db')
const ExpressError = require('../expressError')
const slugify = require("slugify");


router.get('/', async (req, res, next) => {
    try {
        let results = await db.query(`
        SELECT code, name 
        FROM companies
        order by name`);

        return res.json({ companies: results.rows })

    } catch (e) {
        return next(e)
    }
})

router.get(`/:code`, async (req, res, next) => {
    try {
        let code = req.params.code;

        const compResults = await db.query(
            `SELECT *
               FROM companies 
               WHERE code = $1`,
            [code]
        );

        const invResult= await db.query(
            `SELECT * FROM invoices 
            WHERE comp_code=$1`,
            [code]
        )
        if (compResults.rows.length === 0) {
            throw new ExpressError(`Cannot find company with code: ${code}`, 404)
        }


       const company= compResults.rows[0];
       const invoices=invResult.rows;

        company.invoices=invoices.map(inv=>inv.id)

        return res.json({"company": company})

    } catch (e) {
        return next(e)
    }
})


router.post('/', async (req, res, next)=>{
    try {
        const {  name, description } = req.body ;
        const code=slugify(name,{lower:true})
        const results = await db.query(`
            INSERT INTO companies (code,name,description)
            VALUES ($1,$2,$3) RETURNING code,name,description
          `, [code, name, description]);
        return res.status(201).json({company: results.rows[0]})

    } catch (e) {
        return next(e)
    }
})

router.put('/:code', async(req,res,next)=>{
    try{
        const {code}=req.params ;
        const{name,description}= req.body;
        const results= await db.query(`
        UPDATE companies SET name=$1, description=$2
        WHERE code=$3 RETURNING code, name, description
        `, [name,description,code])

        if(results.rows.length===0){
            throw new ExpressError(`NO such company with code of ${code} `,404)
        }
        return res.json({company: results.rows[0]})
        
    }catch(e){
        return next(e)
    }
})


router.delete('/:code',async (req,res,next)=>{
    try{
        const {code}=req.params
        const results= await db.query(`
            DELETE FROM companies 
            WHERE code=$1
            RETURNING code`,[code]
            );
        if(results.rows.length===0){
                throw new ExpressError(`NO such company with code of ${code} `,404)
        }
        else{
            return res.json({"status": "deleted"});
        }

    }catch(e){
        return next(e)
    }
})

router.put

module.exports = router