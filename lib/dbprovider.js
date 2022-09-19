const { MysqlProvider } = require('./mysql-provider');
const { PostgresProvider } = require('./postgres-provider');

const SqlProvider = {
    "PostgresProvider": null,
    "MySql": null
}

const DbProvider = class{ 
    getSqlProvider = (connectionDetails) => {
        //console.log(connectionDetails);
        if(connectionDetails != null  && connectionDetails != undefined){
            SqlProvider.PostgresProvider = this.getPostgresProvider(connectionDetails.Pg);
            SqlProvider.MySqlProvider = this.getMySqlProvider(connectionDetails.MySql);
        }
        else{
            SqlProvider.PostgresProvider = this.getPostgresProvider(null);
            SqlProvider.MySqlProvider = this.getMySqlProvider(null);
        }
        return SqlProvider;
    }

    getMySqlProvider = (connectionDetails) => {
        if(connectionDetails != null && connectionDetails != undefined){
            delete process.env.Database_MYSQL_ConnectionStr;
            delete process.env.Database_MYSQL_Host;
            delete process.env.Database_MYSQL_User;
            delete process.env.Database_MYSQL_Database;
            delete process.env.Database_MYSQL_Password;
            delete process.env.Database_MYSQL_Port;
            delete process.env.Database_MYSQL_ConnectionTimeoutMillis;
            delete process.env.Database_MYSQL_MaxClients;
            delete process.env.Database_MYSQL_WaitForConnections;

            if(connectionDetails.ConnectionStr != null)
            process.env.Database_MYSQL_ConnectionStr = connectionDetails.ConnectionStr;
        
            if(connectionDetails.Host != null)
                process.env.Database_MYSQL_Host = connectionDetails.Host;

            if(connectionDetails.User != null)
                process.env.Database_MYSQL_User = connectionDetails.User;

            if(connectionDetails.Database != null)
                process.env.Database_MYSQL_Database = connectionDetails.Database;

            if(connectionDetails.Password != null)
                process.env.Database_MYSQL_Password = connectionDetails.Password;

            if(connectionDetails.Port != null)
                process.env.Database_MYSQL_Port = connectionDetails.Port;

            if(connectionDetails.ConnectionTimeoutMillis != null)
                process.env.Database_MYSQL_ConnectionTimeoutMillis = connectionDetails.ConnectionTimeoutMillis;
                    
            if(connectionDetails.MaxClients != null)
                process.env.Database_MYSQL_MaxClients = connectionDetails.MaxClients;
            
                if(connectionDetails.WaitForConnections != null)
                process.env.Database_MYSQL_WaitForConnections = connectionDetails.WaitForConnections;
        }
        
        if(process.env.Database_MYSQL_ConnectionStr != null && process.env.Database_MYSQL_ConnectionStr != undefined){
            console.log("Connecting with connection string.");
            const mysql = require('mysql2');
            const pool = mysql.createPool(process.env.Database_MYSQL_ConnectionStr);
            return new MysqlProvider(pool);
        }

        if(process.env.Database_MYSQL_Host != null && process.env.Database_MYSQL_Host != undefined){
            console.log("Connecting with params");
            const mysql = require('mysql2');
            const pool = mysql.createPool({ 
                host: process.env.Database_MYSQL_Host,
                user: process.env.Database_MYSQL_User,
                password: process.env.Database_MYSQL_Password,
                database: process.env.Database_MYSQL_Database,
                port: process.env.Database_MYSQL_Port,
                connectTimeout: process.env.Database_MYSQL_ConnectionTimeoutMillis,
                waitForConnections: process.env.Database_MYSQL_WaitForConnections
            });
            return new MysqlProvider(pool);
        }
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
                max: process.env.Database_POSTGRES_maxClients,
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
}

module.exports.DbProvider = DbProvider;