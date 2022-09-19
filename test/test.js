const {DbProvider} = require("../lib/dbprovider");

const ConnectionDetails = {
    Pg: {
        ConnectionStr: null,
        Host: null,
        Fromenv: false,
        MaxClients: 10,
        ConnectionTimeoutMillis: 30000,
        User: null,
        Database: null,
        Password: null,
        Port: "49153",
        IdleTimeoutMillis: 10000
    },
    MySql:{
        ConnectionStr: null,
        Host: "localhost",
        Port: "3306",
        User: "dmitriy",
        Database: "music_store",
        Password: "dmitriyAdmin",
        ConnectionTimeoutMillis: 30000,
        MaxClients: 10,
        WaitForConnections: true
    }
}

const pgConStrTest = async () =>{
    console.log("--- Postgres connection string test:");
    ConnectionDetails.Pg.ConnectionStr = "postgres://postgres:postgrespw@host.docker.internal:49153/music_store";
    let pgProvider = new DbProvider().getSqlProvider(ConnectionDetails).PostgresProvider;
    let result = await pgProvider.selectRows("SELECT NOW() as now");
    console.log("pgConStrTest Now from db:" + result[0].now);
    await pgProvider.pool.end();
    console.log("---");
}
const pgConObjTest = async () =>{
    console.log("--- Postgres connection object test:");
    ConnectionDetails.Pg.ConnectionStr = null;
    ConnectionDetails.Pg.Host = "host.docker.internal";
    ConnectionDetails.Pg.User = "postgres";
    ConnectionDetails.Pg.Database = "music_store";
    ConnectionDetails.Pg.Password = "postgrespw";
    let pgProvider = new DbProvider().getSqlProvider(ConnectionDetails).PostgresProvider;
    let result = await pgProvider.selectRows("SELECT NOW() as now");
    await pgProvider.pool.end();
    console.log("pgConObjTest Now from db" + result[0].now);
    console.log("---");
}
const pgCreateInsertUpdateTest = async () =>{
    console.log("--- Postgres create insert/update/select test:");
    ConnectionDetails.Pg.ConnectionStr = "postgres://postgres:postgrespw@host.docker.internal:49153/music_store";
    let pgProvider = new DbProvider().getSqlProvider(ConnectionDetails).PostgresProvider;
    await pgProvider.scalar('create table if not exists public.testtbl("Id" integer NOT NULL, "Title" character varying)');
    let testObj = {Id: 1, Title: "War and Peace"};
    await pgProvider.insertObject(testObj, "testtbl");
    let result = await pgProvider.selectRows('select * from testtbl where "Id" = ' + pgProvider.makeParameter("1"), [1]);
    console.log(result[0].Title);
    testObj.Title = "Idiot";
    await pgProvider.updateObject(testObj,"testtbl",{Id: 1});
    result = await pgProvider.selectRows('select * from testtbl where "Id" = '  + pgProvider.makeParameter("1"), [1]);
    console.log(result[0].Title);
    await pgProvider.scalar("drop table testtbl");
    await pgProvider.pool.end();
    console.log("---");
}

const pgTransactionTest = async () => {
    console.log("--- Postgres transaction test:");
    let pgProvider = new DbProvider().getSqlProvider(ConnectionDetails).PostgresProvider;
    await pgProvider.scalar('create table if not exists public.testtbl1("Id" integer NOT NULL, "Title" character varying)');
    await pgProvider.scalar('create table if not exists public.testtbl2("Id" integer NOT NULL, "Title" character varying)');
    const client = await pgProvider.getClient();
    try{
        await client.query('BEGIN');

        const sql1 = 'insert into testtbl1 ("Id","Title") values(' + pgProvider.makeParameter("1") + ',' + pgProvider.makeParameter("2") + ')';
        const param1 = [1,"War and Peace"];
        
        const sql2 = 'insert into testtbl2 ("Id","Title") values(' + pgProvider.makeParameter("1") + ',' + pgProvider.makeParameter("2") + ')';
        const param2 = [1,"Idiot"];

        await client.query(sql1,param1);
        await client.query(sql2, param2);
        await client.query('COMMIT');
    }catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
        let result = await pgProvider.selectRows('select * from testtbl1 where "Id" = '  + pgProvider.makeParameter("1"), [1]);
        if(result[0])
            console.log(result[0].Title);
        result = await pgProvider.selectRows('select * from testtbl2 where "Id" = '  + pgProvider.makeParameter("1"), [1]);
        if(result[0])
            console.log(result[0].Title);
        await pgProvider.scalar("drop table testtbl1");
        await pgProvider.scalar("drop table testtbl2");
        pgProvider.pool.end();
        console.log("---");
    }
}

const mysqlConStrTest = async () => {
    console.log("--- Mysql connection string test:");
    ConnectionDetails.MySql.ConnectionStr = "mysql://dmitriy:dmitriyAdmin@localhost:3306/db?database=music_store";
    let mysqlProvider = new DbProvider().getSqlProvider(ConnectionDetails).MySqlProvider;
    mysqlProvider.pool.end();
    console.log("---");
}

const mysqlCreateInsertUpdateTest = async () =>{
    console.log("--- Mysql create insert/update/select test:");
    let mysqlProvider = new DbProvider().getSqlProvider(ConnectionDetails).MySqlProvider;
    await mysqlProvider.scalar("create table if not exists testtbl(`Id` INT NOT NULL AUTO_INCREMENT, `Title` VARCHAR(45) NOT NULL, PRIMARY KEY (`Id`))");
    let testObj = {Title: "War and Peace"};
    let result = await mysqlProvider.insertObject(testObj, "testtbl");
    testObj.Id = result.rows.insertId;
    console.log("Inserted row Id: " + testObj.Id);
    result = await mysqlProvider.selectRows("select * from testtbl where `Id` = " + mysqlProvider.makeParameter(),[testObj.Id]);
    console.log("Title: " + result[0].Title);
    testObj.Title = "Idiot";
    await mysqlProvider.updateObject(testObj, "testtbl", {Id: testObj.Id});
    result = await mysqlProvider.selectRows("select * from testtbl where `Id` = " + mysqlProvider.makeParameter(),[testObj.Id]);
    console.log("Title: " + result[0].Title);
    await mysqlProvider.scalar("drop table testtbl");
    mysqlProvider.pool.end();
    console.log("---");
}

const mysqlTransactionTest = async () => {
    console.log("--- Mysql transaction test:");
    let mysqlProvider = new DbProvider().getSqlProvider(ConnectionDetails).MySqlProvider;
    await mysqlProvider.scalar("create table if not exists testtbl1(`Id` INT NOT NULL AUTO_INCREMENT, `Title` VARCHAR(45) NOT NULL, PRIMARY KEY (`Id`))");
    await mysqlProvider.scalar("create table if not exists testtbl2(`Id` INT NOT NULL AUTO_INCREMENT, `Title` VARCHAR(45) NOT NULL, PRIMARY KEY (`Id`))");
    const client = await mysqlProvider.getClient();
    try{
        await client.beginTransaction();
        const sql1 = 'insert into testtbl1 (`Id`,`Title`) values(' + mysqlProvider.makeParameter() + ',' + mysqlProvider.makeParameter() + ')';
        const param1 = [1,"War and Peace"];
        
        const sql2 = 'insert into testtbl2 (`Id`,`Title`) values(' + mysqlProvider.makeParameter() + ',' + mysqlProvider.makeParameter() + ')';
        const param2 = [1,"Idiot"];

        await client.query(sql1,param1);
        await client.query(sql2, param2);
        await client.commit();
    }catch (e) {
        await client.rollback();
        //throw e;
    } finally {
        client.release();
        let result = await mysqlProvider.selectRows('select * from testtbl1 where `Id` = '  + mysqlProvider.makeParameter(), [1]);
        if(result[0]){
            console.log(result[0].Title);
        }
        else
            console.log("No record inserted");
        
        result = await mysqlProvider.selectRows('select * from testtbl2 where `Id` = '  + mysqlProvider.makeParameter(), [1]);
        if(result[0]){
            console.log(result[0].Title);
        }
        else
            console.log("No record inserted");

        await mysqlProvider.scalar("drop table testtbl1");
        await mysqlProvider.scalar("drop table testtbl2");
        mysqlProvider.pool.end();
        console.log("---");
    }
}

(async () => {
    await pgConStrTest();
    await pgConObjTest();
    await pgCreateInsertUpdateTest();
    await pgTransactionTest();
    await mysqlConStrTest();
    await mysqlCreateInsertUpdateTest();
    await mysqlTransactionTest();
})().catch(e => {
    console.error(e.stack);
});