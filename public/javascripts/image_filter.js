/*
 * @Author: Rui Li
 * @Date: 2020-01-16 12:03:29
 * @LastEditTime: 2020-06-27 17:53:49
 * @Description: 
 * @FilePath: /VisImageNavigator.github.io/public/javascripts/image_filter.js
 */

var figureIndex = [-1, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 50, 51, 100];
var tableIndex = [16];
var algoIndex = [18];
var equaIndex = [19];





/**
 * return a subset of datasets based on the given authors
 * @param {} data 
 * @param {*} author 
 */
function filterDataByAuthors(data, author) {
    var filterData = data.filter(function(item) {
        let authorList = swapArrayString(item['Author'].split(';'));
        return authorList.includes(author);
    });
    return filterData;
}


/**
 * given the encoding type, filter the data
 * the basic idea is for each data item, check if the encoding_type includes any of the selected types
 * if there is no type selected, return the full dataset
 * @param {*} data 
 * @param {*} type 
 */
function filterDataByimageType(data, type) {
    console.log(type);
    if (type.length == 0) {
        return data;
    }
    var filterData = data.filter(function(item) {
        let isFlag = false;
        if (parseInt(item['check_image_type']) == 1) {
            for (let i = 0; i < type.length; i++) {
                if (item['image_type'].split(';').includes(type[i])) {
                    isFlag = true;
                    break;
                }
            }
        }
        return isFlag;
    });
    return filterData;
}

/**
 * filter dataset by functional type
 * @param {*} data 
 * @param {*} type 
 * @returns 
 */
function filterDataBylegendType(data, type) {
    if (type.length == 0) {
        return data;
    }
    var filterData = data.filter(function(item) {
        let isFlag = false;
        if (parseInt(item['check_color_legend']) == 1) {
            for (let i = 0; i < type.length; i++) {
                if (item['color_legend'].split(';').includes(type[i])) {
                    isFlag = true;
                    break;
                }
            }
        }
        return isFlag;
    });
    return filterData;
}

/**
 * filter dataset by functional type
 * @param {*} data 
 * @param {*} type 
 * @returns 
 */
 function filterDataBymapType(data, type) {
    if (type.length == 0) {
        return data;
    }
    var filterData = data.filter(function(item) {
        let isFlag = false;
        if (parseInt(item['check_color_map']) == 1) {
            for (let i = 0; i < type.length; i++) {
                if (item['color_map'].split(';').includes(type[i])) {
                    isFlag = true;
                    break;
                }
            }
        }
        return isFlag;
    });
    return filterData;
}

/**
 * filter data by hardness
 * @param {*} data 
 * @param {*} hardness 
 * @returns 
 */
// function filterDataByHardness(data, hardness) {
//     if (hardness == '') {
//         return data;
//     } else {
//         var filterData = data.filter(function(item) {
//             return hardness == item['hardness_type'];
//         });
//         return filterData;
//     }
// }


function filterDataByusageType(data, type) {
    if (type.length == 0) {
        return data;
    }
    var filterData = data.filter(function(item) {
        let isFlag = false;
        if (parseInt(item['color_usage']) == 1) {
            for (let i = 0; i < type.length; i++) {
                if (item['color_usage'].split(';').includes(type[i])) {
                    isFlag = true;
                    break;
                }
            }
        }
        return isFlag;
    });
    return filterData;
}

function filterDataByComposition(data, type) {
    if (type.length == 0) {
        return data;
    }
    var filterData = data.filter(function(item) {
        let isFlag = false;
        if (parseInt(item['check_comp_type']) == 1) {
            for (let i = 0; i < type.length; i++) {
                if (item['comp_type'].split(';').includes(type[i])) {
                    isFlag = true;
                    break;
                }
            }
        }
        return isFlag;
    });
    return filterData;
}



/**
 * 
 * @param {} data 
 * @param {*} type 
 */
function filterDataByAlgoEquaType(data, type) {
    if (type.length == 2) {
        var filterData = data.filter(function(item) {
            let boolean = parseInt(item['vis_type']) == 18 || parseInt(item['vis_type']) == 19;
            return boolean;
        });
        return filterData;
    } else if (type.length == 0) {
        var filterData = data.filter(function(item) {
            let boolean = parseInt(item['vis_type']) != 18 && parseInt(item['vis_type']) != 19;
            return boolean;
        });
        return filterData;
    } else if (type.length == 1) {
        if (type[0] == 'Algorithm') {
            var filterData = data.filter(function(item) {
                let boolean = parseInt(item['vis_type']) == 18;
                return boolean;
            });
            return filterData;
        } else if (type[0] == 'Equation') {
            var filterData = data.filter(function(item) {
                let boolean = (parseInt(item['vis_type']) == 19);
                return boolean;
            });
            return filterData;
        }
    }
}


/**
 * return conference subset
 * @param {selected conferences} confs 
 * @param {selected paper type} 
 */
function filterDataByConference(data, confs) {
    var filterData = data.filter(function(item) {
        return confs.includes(item['conference']);
    });
    
    return filterData;
}

function filterDataByPaperType(data, papers) {
   
    var filterData = data.filter(function(item) {
        return papers.includes(item['paper_type']);
    });

    
    return filterData;
}

/**
 * return image dataset with the year range
 * @param {*} minYear 
 * @param {*} maxYear 
 */
function filterDataByYear(data, minYear, maxYear) {
    var filterData = data.filter(function(item) {
        return (minYear <= item['year']) & (item['year'] <= maxYear);
    });
    return filterData;
}

/**
 * return image dataset with the year range
 * @param {*} minNum
 * @param {*} maxNum
 */
 function filterDataByNumber(data, minNum, maxNum) {
    var filterData = data.filter(function(item) {
        return (parseInt(minNum) <= item['color_number']) & (item['color_number'] <= parseInt(maxNum));
    });
    return filterData;
}