const PostgresProvider = class {
    constructor(pool){
        this.pool = pool;
    }

    seqNextval = async (seqName) =>{
        const sql = "select nextval($1)";
        let result = await this.scalar(sql,[seqName]);
        return result.rows[0].nextval;
    }

    scalar = async (sql, params) => {
        const result = await this.pool.query(sql, params);
        //console.log("Result from scalar: " + result.rows);
        return result;
    };

    selectRows = async (sql, params) => {
        const result = await this.scalar(sql,params);
        return result.rows;
    }

    insertObject = async (object, tableName) => {
        if(object == null || object == undefined)
            throw new Error("Object is undefined");
        
        if(tableName == null || tableName == undefined)
            throw new Error("tableName is undefined.");

        let sql = 'insert into "' + tableName + '"';
        let fields = ' (';
        let values = '(';
        let paramValues = [];
        let i = 1; 
        Object.entries(object).forEach(([key, value]) => {
                fields += '"' + key + '",';
                values += "$" + i + ",";
                paramValues.push(value);
                i++;
        });
        fields = fields.substring(0,fields.length - 1) + ")";
        values = values.substring(0,values.length - 1) + ")";
        sql += fields + " values " + values;
        //console.log(sql);
        await this.scalar(sql, paramValues);
    }
    updateObject = async (object, tableName, whereKVs) => {
        if(object == null || object == undefined)
            throw new Error("Object is undefined");
        
        if(tableName == null || tableName == undefined)
            throw new Error("tableName is undefined.");
        if(whereKVs == null || whereKVs == undefined || whereKVs.length < 1)
            throw new Error("whereKVs are underfined");
        
        let sql = 'update "' + tableName + '" set ';
        let paramValues = [];
        let i = 1;
        Object.entries(object).forEach(([key, value]) => {
            sql += '"' + key + '"=$' + i + ',';
            paramValues.push(value);
            i++;
        });
        sql = sql.substring(0,sql.length - 1) + ' where';

        Object.entries(whereKVs).forEach(([key, value]) => {
            sql += ' "' + key + '"=$' + i + ' and';
            paramValues.push(value);
            i++;
        });
        sql = sql.substring(0,sql.length - 3);
        //console.log(sql);
        await this.scalar(sql, paramValues);
    }
    makeParameter = (paramName) =>{
        return "$" + paramName;
    }
    getClient = async () => {
        return await this.pool.connect();
    }
}

module.exports.PostgresProvider = PostgresProvider;