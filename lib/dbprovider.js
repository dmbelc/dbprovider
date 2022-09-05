const { PostgresProvider } = require('./postgres-provider');

const SqlProvider = {
    "PostgresProvider": null,
    "MySql": null
}

const DbProvider = class{ 
    getSqlProvider = (connectionDetails) => {
        //console.log(connectionDetails);
        SqlProvider.PostgresProvider = this.getPostgresProvider(connectionDetails.Pg);
        SqlProvider.MySql = this.getMySqlProvider(connectionDetails.MySql);
        return SqlProvider;
    }

    getPostgresProvider = (connectionDetails) =>{
        if(connectionDetails != null && connectionDetails != undefined){
            delete process.env.Database_POSTGRES_ConnectionStr;
            delete process.env.Database_POSTGRES_Host;
            delete process.env.Database_POSTGRES_Fromenv;
            delete process.env.Database_POSTGRES_MaxClients;
            delete process.env.Database_POSTGRES_ConnectionTimeoutMillis;
            delete process.env.Database_POSTGRES_User;
            delete process.env.Database_POSTGRES_Database;
            delete process.env.Database_POSTGRES_Password;
            delete process.env.Database_POSTGRES_Port;
            delete process.env.Database_POSTGRES_IdleTimeoutMillis;

            if(connectionDetails.ConnectionStr != null)
                process.env.Database_POSTGRES_ConnectionStr = connectionDetails.ConnectionStr;

            if(connectionDetails.Host != null)
                process.env.Database_POSTGRES_Host = connectionDetails.Host;

            if(connectionDetails.Fromenv != null)
                process.env.Database_POSTGRES_Fromenv = connectionDetails.Fromenv;

            if(connectionDetails.MaxClients != null)
                process.env.Database_POSTGRES_MaxClients = connectionDetails.MaxClients;

            if(connectionDetails.ConnectionTimeoutMillis != null)
                process.env.Database_POSTGRES_ConnectionTimeoutMillis = connectionDetails.ConnectionTimeoutMillis;

            if(connectionDetails.User != null)
                process.env.Database_POSTGRES_User = connectionDetails.User;

            if(connectionDetails.Database != null)
                process.env.Database_POSTGRES_Database = connectionDetails.Database;

            if(connectionDetails.Password != null)
                process.env.Database_POSTGRES_Password = connectionDetails.Password;

            if(connectionDetails.Port != null)
                process.env.Database_POSTGRES_Port = connectionDetails.Port;

            if(connectionDetails.IdleTimeoutMillis != null)
                process.env.Database_POSTGRES_IdleTimeoutMillis = connectionDetails.IdleTimeoutMillis;
        }
        const postgresConStr = process.env.Database_POSTGRES_ConnectionStr;
        const postgresHost = process.env.Database_POSTGRES_Host;
        const postgresFromenv = process.env.Database_POSTGRES_Fromenv;
        if(postgresConStr != null || postgresConStr != undefined){
            const { Pool } = require('pg');
            //console.log("Connecting to string: " + postgresConStr);
            const pool = new Pool({
                connectionString: postgresConStr, 
                max: process.env.Database_POSTGRES_axClients,
                connectionTimeoutMillis: process.env.Database_POSTGRES_ConnectionTimeoutMillis,
                idleTimeoutMillis: process.env.Database_POSTGRES_IdleTimeoutMillis
            });
            
            return new PostgresProvider(pool);
        }
        if(postgresHost != null || postgresHost != undefined)
        {
            const { Pool } = require('pg');
            const pool = new Pool({ 
                user: process.env.Database_POSTGRES_User, 
                host: process.env.Database_POSTGRES_Host, 
                database: process.env.Database_POSTGRES_Database, 
                password: process.env.Database_POSTGRES_Password, 
                port: process.env.Database_POSTGRES_Port, 
                max: process.env.Database_POSTGRES_MaxClients,
                connectionTimeoutMillis: process.env.Database_POSTGRES_ConnectionTimeoutMillis,
                idleTimeoutMillis: process.env.Database_POSTGRES_IdleTimeoutMillis
                });
            return  new PostgresProvider(pool);
        }
        if(postgresFromenv !== true)
        {
            const { Pool } = require('pg');
            const pool = new Pool();
            return new PostgresProvider(pool);
        }
        return null;
    }

    getMySqlProvider = (connectionDetails) => {
        return null;
    }
}

module.exports.DbProvider = DbProvider;