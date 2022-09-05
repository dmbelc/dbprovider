const {DbProvider} = require("../dbprovider");

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

    }
}

const pgConStrTest = async () =>{
    ConnectionDetails.Pg.ConnectionStr = "postgres://postgres:postgrespw@host.docker.internal:49153/music_store";
    let pgProvider = new DbProvider().getSqlProvider(ConnectionDetails).PostgresProvider;
    let result = await pgProvider.selectRows("SELECT NOW() as now");
    console.log("pgConStrTest Now from db:" + result[0].now);
    await pgProvider.pool.end();
}
const pgConObjTest = async () =>{
    ConnectionDetails.Pg.ConnectionStr = null;
    ConnectionDetails.Pg.Host = "host.docker.internal";
    ConnectionDetails.Pg.User = "postgres";
    ConnectionDetails.Pg.Database = "music_store";
    ConnectionDetails.Pg.Password = "postgrespw";
    let pgProvider = new DbProvider().getSqlProvider(ConnectionDetails).PostgresProvider;
    let result = await pgProvider.selectRows("SELECT NOW() as now");
    await pgProvider.pool.end();
    console.log("pgConObjTest Now from db" + result[0].now);
}
const pgCreateInsertUpdateTest = async () =>{
    ConnectionDetails.Pg.ConnectionStr = "postgres://postgres:postgrespw@host.docker.internal:49153/music_store";
    let pgProvider = new DbProvider().getSqlProvider(ConnectionDetails).PostgresProvider;
    await pgProvider.scalar('create table if not exists public.testtbl("Id" integer NOT NULL, "Title" character varying)');
    let testObj = {Id: 1, Title: "War and Pice"};
    await pgProvider.insertObject(testObj, "testtbl");
    let result = await pgProvider.selectRows('select * from testtbl where "Id" = 1');
    console.log(result[0].Title);
    testObj.Title = "Idiot";
    await pgProvider.updateObject(testObj,"testtbl",{Id: 1});
    result = await pgProvider.selectRows('select * from testtbl where "Id" = 1');
    console.log(result[0].Title);
    await pgProvider.scalar("drop table testtbl");
    await pgProvider.pool.end();
}
(async () => {
    await pgConStrTest();
    await pgConObjTest();
    await pgCreateInsertUpdateTest();
})().catch(e => {
    console.error(e.stack);
});