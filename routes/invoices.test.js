const request=require("supertest")

const app=require('../app');
const {createData}=require("../_test-common")

const db=require("../db")

//before each test, clean out data

afterAll(async()=>{
    await db.end()
})


describe("GET /", function(){
    test("It should return array of invoices", async()=>{
        const response= await request(app).get('/invoices');
        expect(response.body).toEqual({
            "invoices": [
              {id: 1, comp_code: "apple"},
              {id: 2, comp_code: "apple"},
              {id: 3, comp_code: "ibm"},
            ]
          });
    })
})

describe("Get /1", function(){
    test("It return invoice info", async function () {
    const response = await request(app).get("/invoices/1");
    expect(response.body).toEqual(
        {
          "invoice": {
            id: 1,
            amt: 100,
            add_date: '2018-01-01T05:00:00.000Z',
            paid: false,
            paid_date: null,
            company: {
              code: 'apple',
              name: 'Apple',
              description: 'Maker of OSX.',
            }
          }
        }
    );
  });

  test("It should return 404 for no such invoice ", async function(){
    const response = await request(app).get("/invoices/88");
    expect (response.status).toEqual(404)
  })
})

describe("POST /", function () {

    test("It should add invoice", async function () {
      const response = await request(app)
          .post("/invoices")
          .send({amt: 400, comp_code: 'ibm'});
  
      expect(response.body).toEqual(
          {
            "invoice": {
              id: 4,
              comp_code: "ibm",
              amt: 400,
              add_date: expect.any(String),
              paid: false,
              paid_date: null,
            }
          }
      );
    });
  });

describe("PUT /", function(){

    test("It should update an invoice", async function(){
        const response= await request(app)
                        .put('/invoices/1')
                        .send({amt: 1000, paid: false});
    expect(response.body).toEqual(
        {
            "invoice": {
              id: 1,
              comp_code: 'apple',
              paid: false,
              amt: 1000,
              add_date: expect.any(String),
              paid_date: null,
            }
          }

    )
    })

})

describe("DELETE /", function () {

    test("It should delete invoice", async function () {
      const response = await request(app)
          .delete("/invoices/1");
  
      expect(response.body).toEqual({"status": "deleted"});
    });
  
    test("It should return 404 for no-such-invoices", async function () {
      const response = await request(app)
          .delete("/invoices/999");
  
      expect(response.status).toEqual(404);
    });
  });