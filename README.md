# Insight Query Engine

Insight is a typescript-based query processor and execution engine that performs analytics using a custom query language.

It supports many basic analytics commands, including:
- column selection
- filtering
- ordering
- aggregate functions

It also supports nested queries and multiple ordering.

Table of Contents:
- [How to Use Examples](#how-to-use)
- [Supported Features](#supported-features)
    - [WHERE](#where)
        - [GT](#gt)
        - [LT](#lt)
        - [EQ](#eq)
        - [IS](#is)
        - [AND](#and)
        - [OR](#or)
    - [OPTION](#option)
        - [COLUMNS](#columns)
        - [ORDER](#order)
    - [TRANSFORMATIONS](#transformations)
        - [MAX](#max)
        - [MIN](#min)
        - [SUM](#sum)
        - [AVG](#avg)
        - [COUNT](#count)
- [REST API Service Example](#rest-api-service-example)

See [here](<https://github.com/GitUser520/insight-query-engine>) for the Github page. Based on the Insight UBC class project.

-------------
## How to Use

The query syntax is based on JSON. Simple commands can be nested together to form more complex queries.

Here is an example of a simple `select where` statement:

```JSON
{
    "WHERE": {
        "GT": {
            "courses_avg": 95
        }
    },
    "OPTIONS": {
        "COLUMNS": [
            "courses_avg",
            "courses_title"
        ]
    }
}
```

More complex queries can be formed by nesting together queries with `AND` or `OR` syntax:
```JSON
{
    "WHERE": {
        "AND": [{
            "IS": {
                "courses_dept": "cpsc"
        }},
        {
            "GT": {
            "courses_avg": 90
            }
        }]
    },
    "OPTIONS": {
        "COLUMNS": [
            "courses_dept",
            "courses_avg",
            "courses_title"
        ]
    }
}
```

Results can be order by columns using the `ORDER` option:
```JSON
{
    "WHERE": {
        "LT": {
            "courses_avg": 10
        }
    },
    "OPTIONS": {
        "COLUMNS": [
            "courses_avg",
            "courses_dept",
            "courses_instructor",
            "courses_title",
            "courses_pass",
            "courses_fail",
            "courses_audit",
            "courses_year"
        ],
        "ORDER": {
            "dir": "DOWN",
            "keys": [
                "courses_instructor",
                "courses_dept"
            ]
        }
    }
}
```

We can also perform aggregation by using `TRANSFORMATIONS`:
```JSON
{
    "WHERE": {
        "GT": {
            "courses_avg": 95
        }
    },
    "OPTIONS": {
        "COLUMNS": [
            "courses_avg",
            "courses_dept",
            "overallSum"
        ],
        "ORDER": {
            "dir": "UP",
            "keys": [
                "courses_avg",
                "courses_dept"
            ]
        }
    },
    "TRANSFORMATIONS": {
        "GROUP": [
            "courses_avg",
            "courses_dept"
        ],
        "APPLY": [
            {
                "overallSum": {
                    "SUM": "courses_avg"
                }
            }
        ]
    }
}
```

-------------
## Supported Features

The project currently supports the following filters and options:
- [WHERE](#where)
    - [GT](#gt)
    - [LT](#lt)
    - [EQ](#eq)
    - [IS](#is)
    - [AND](#and)
    - [OR](#or)
- [OPTION](#option)
    - [COLUMNS](#columns)
    - [ORDER](#order)
        - [Single Selection](#single-selection)
        - [Multiple Selection](#multiple-selection)
- [TRANSFORMATIONS](#transformations)
    - [MAX](#max)
    - [MIN](#min)
    - [SUM](#sum)
    - [AVG](#avg)
    - [COUNT](#count)


### WHERE
The `WHERE` keyword is used to filter columns based on a given condition. It takes supports only one condition, but can be expanded by using `AND` or `OR` keywords.

Syntax:
```JSON
{
    "WHERE": {
        // replace <filter-keyword> with a filter keyword
        "<filter-keyword>": {
            // replace <column> with the column name
            "<column>": 0
        }
    }
}
```

#### GT
The `GT` keyword is used to filter for records greater than a numeric value in the specified column.

Example:
```JSON
{
    "WHERE": {
        "GT": {
            "year": 2017
        }
    }
}
```

#### LT
The `LT` keyword is used to filter for records less than a numeric value in the specified column.

Example:
```JSON
{
    "WHERE": {
        "LT": {
            "year": 2017
        }
    }
}
```

#### EQ
The `EQ` keyword is used to filter for records equal to a numeric value in the specified column.

Example:
```JSON
{
    "WHERE": {
        "EQ": {
            "year": 2017
        }
    }
}
```

#### IS
The `IS` keyword is used to filter for records that match a string value in the specified column.

Example:
```JSON
{
    "WHERE": {
        "GT": {
            "year": "2017"
        }
    }
}
```

#### AND
The `AND` keyword is used to add more filter conditions to the query. It will select records that satisfy **all** given conditions.

Example:
```JSON
{
    "WHERE": {
        "AND": [{
            "EQ": {
                "year": 2017
            }
        }, 
        {
            "GT": {
                "age": 23
            }
        }]
    }
}
```

#### OR
The `OR` keyword is used to add more filter conditions to the query. It will select the records that satisfy **any** given conditions.

Example:
```JSON
{
    "WHERE": {
        "OR": [{
            "EQ": {
                "year": 2017
            }
        }, 
        {
            "GT": {
                "age": 23
            }
        }]
    }
}
```

### OPTION
The `OPTION` keyword is used to attach options to the query. This includes column selection, multiple ordering, and aggregate functions.

Syntax:
```JSON
{
    "OPTIONS": {
        // replace <option-keyword> with the keyword for the option
        "<option-keyword>": {
            // option body
            ...
        }
    }
}
```

#### COLUMNS
The `COLUMNS` keyword is used to select items from a query. Columns are listed by name in the query, and these will be the values returned by the query engine.

Example:
```JSON
{
    "OPTIONS": {
        "COLUMNS": [
            "year",
            "age",
            "title"
        ]
    }
}
```

#### ORDER
The `ORDER` column is used to order the records by ascending or descending order. It supports both single selection and multiple selection.

##### Single Selection
You can select one column to order by ascending order by directly providing a column name in the `ORDER` section.

Example:
```JSON
{
    "OPTIONS": {
        "ORDER": "year"
    }
}
```

##### Multiple Selection
You can select multiple columns by using the `dir` and `keys` keywords.

Example:
Example:
```JSON
{
    "OPTIONS": {
        "ORDER": {
            "dir": "UP",
            "keys": [
                "year", 
                "age"
            ]
        }
    }
}
```

### TRANSFORMATIONS
Transformations can be applied in the query to better analyze the dataset. Insight supports aggregate functions via keywords. See below for each keyword.

#### MAX
The `MAX` keyword is used to find the maximum value of a column in a collection of records.

#### MIN
The `MIN` keyword is used to find the minimum value of a column in a collection of records.

#### SUM
The `SUM` keyword is used to find the sum of the values of a column in a collection of records.

#### AVG
The `AVG` keyword is used to find the average value of a column in a collection of records.

#### COUNT
The `COUNT` keyword is used to find the number of records for a given column in the collection of records.

-------------
## REST API Service Example
The example service is currently implemented as a local REST API service. A dataset is first preloaded into the service with a HTTP `PUT` request. The data is then extracted and loaded into memory for searching.
When HTTP requests are sent to the endpoint, it parses the JSON request and queries the dataset for entries that match the request.

If the corresponding values are found, the service returns a `200` status code and the requested values in the body of the response.

If no valid values are found, it will return a `200` status code with an empty array in the body of the response.

If the request is formatted incorrectly, it will return a `4XX` status code representing request was invalid or query execution failed.

Clone the code base and run `npm start` to start the service locally.
