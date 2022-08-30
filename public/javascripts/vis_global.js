/**
 * @Description The global control of the system
 * @Author: Rui Li
 * @Date: 9/10/19
 */

//global variables
var ifDB = 0; //if use database
var G_PAP_DATA = new Object(); // image-paper dataset
var G_IMG_DATA = new Object(); // image dataset
var G_PAPER; //paper dataset
var G_IMG_FULL_DATA = new Object(); //image dataset with null images
var searchMode = 1; //1: keywords search, 2: word search (title and abstract)
var ifAllImage = 1; //if all image are presented
var visMode = 1; //1: image mode, 2: paper mode, 3: paper card mode
var yearPageDic = {}; //store the page index of each year for images
var yearPageDicPaper = {}; //store the 
var currentYearRange = [1990, 2020]; //store the current year range
var currentConferences = ['Vis', 'SciVis', 'InfoVis', 'VAST'];
var currentPaperType = ['C', 'J'];
// var currentimageTypes = ['bar', 'point', 'line', 'node-link',
//     'area', 'surface-volume', 'grid', 'glyph',
//     'schematic', 'gui', 'pattern', 'text',
//     'color', 'others'];
var currentimageTypes = [];
var currentusageTypes = [];
var currentlegendTypes = [];
var currentmapTypes = [];
var minColorNum = -1;
var maxColorNum = 1000;

var img_per_page = 200;
var paper_per_page = 20;
var showCaption = 0; //if show figure with caption
var scrollMode = 1; //if used the scroll mode

var confDic = {
    'Vis': '#FBAF3F',
    'InfoVis': '#EF4036',
    'SciVis': '#1B75BB',
    'VAST': '#38B449'
}


var pageUI = new Object();
var scentData = {

};
var scentDataArr = [];

//used for timeline papercard: if user hide one time dot, set it to 1
var timelineStatus = {};


$(document).ready(function() {
    if (ifDB == 0) {
        dbStart();
    } else {

    }
});


/**
 * init dataset
 * @returns {Promise<void>}
 */
async function dbStart() {

    G_IMG_DATA = await d3.csv("./public/dataset/Annotation.csv");
    G_PAPER = await d3.csv("./public/dataset/paperData_3.0.3.csv");
    //G_PAPER = stratifyPaperData(G_PAPER);
    console.log(G_IMG_DATA);
    G_IMG_DATA = sortImageByYear(G_IMG_DATA); //sort images by year, then sort by conference, the sort by first page.
    G_IMG_DATA = getCompleteOnes(G_IMG_DATA);
    console.log(G_IMG_DATA);
    //group images to paper dataset
    G_IMG_FULL_DATA = [...G_IMG_DATA];
    G_PAP_DATA = extractPaperData(G_IMG_FULL_DATA);
    //remove null images from image dataset, i.e. papers without image
    G_IMG_DATA = G_IMG_DATA.filter(function(item) {
        let flag = item['paperImageName'] != 'N/A';
        return flag;
    });



    //initialize variables
    initializeGlobalVariables();

    countImageByYear(G_IMG_DATA); //update image data



    //params of image numbers
    var img_count = G_IMG_DATA.length;
    var total_pages = Math.ceil(img_count / img_per_page);


    //console.log(G_PAP_DATA);

    //create the dictionary to store the scent information, i.e. 1990: 1, 1995: 5, year: pageIndex
    resetYearIndexDic(G_IMG_DATA);
    resetYearIndexDicPaper(G_PAP_DATA);

    //back to top ui
    var btn = $('#back-to-top-button');

    $(window).scroll(function() {
        if ($(window).scrollTop() > 300) {
            btn.addClass('show');
        } else {
            btn.removeClass('show');
        }
    });

    //press esc to close the paper details
    $("body").keydown(function(e) {
        // esc
        if ((e.keyCode || e.which) == 27) {
            var modal = document.getElementById('myModal');
            modal.style.display = "none";
        }

    });

    btn.on('click', function(e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: 0
        }, '300');
    });

    //detect if the window size changes
    $(window).resize(function() {
        if (scrollMode == 0) {
            let bodyHeight = $(window).height();
            //find the top position of the gallery
            let imageGalleryTop = document.getElementById("image-gallery").offsetTop;
            let maximumHeight = bodyHeight - imageGalleryTop - 10;
            $("#image-gallery").css("max-height", maximumHeight);
        }
    });



    //set up multi-page interface
    pageUI = new Page({
        id: 'pagination',
        pageTotal: total_pages, //total pages
        pageAmount: img_per_page, //numbers of items per page
        dataTotal: img_count, //number of all items
        curPage: 1, //initial page number
        pageSize: 10, //how many papes divides
        showPageTotalFlag: true, //show data statistics
        showSkipInputFlag: true, //show skip
        getPage: function(page) {
            //get current page number
            let currentData = G_IMG_DATA.slice(img_per_page * (page - 1), img_per_page * page);
            presentImg(currentData, 0, 0, 1, 0);
        }
    });





    //filter conferences
    $('input[name="visOptions"]').unbind('click').click(function() {});
    $('input[name="visOptions"]').click(function() {
        let activeConf = [];
        if ($('#vis-check').prop("checked")) {
            $('#vis-check-label').css('background', confDic['Vis']);
            $('#vis-check-label').css('border', '0px');
            activeConf.push('Vis');
        } else {
            $('#vis-check-label').css('background', '#fff');
            $('#vis-check-label').css('border', '1px solid #95a5a6');
        }

        if ($('#scivis-check').prop("checked")) {
            $('#scivis-check-label').css('background', confDic['SciVis']);
            $('#scivis-check-label').css('border', '0px');
            activeConf.push('SciVis');
        } else {
            $('#scivis-check-label').css('background', '#fff');
            $('#scivis-check-label').css('border', '1px solid #95a5a6');
        }

        if ($('#infovis-check').prop("checked")) {
            $('#infovis-check-label').css('background', confDic['InfoVis']);
            $('#infovis-check-label').css('border', '0px');
            activeConf.push('InfoVis');
        } else {
            $('#infovis-check-label').css('background', '#fff');
            $('#infovis-check-label').css('border', '1px solid #95a5a6');
        }

        if ($('#vast-check').prop("checked")) {
            $('#vast-check-label').css('background', confDic['VAST']);
            $('#vast-check-label').css('border', '0px');
            activeConf.push('VAST');
        } else {
            $('#vast-check-label').css('background', '#fff');
            $('#vast-check-label').css('border', '1px solid #95a5a6');
        }
        currentConferences = activeConf;
        filterData();
    });

    //filter tables and figures
    $('input[name="figureOptions"]').unbind('click').click(function() {});
    $('input[name="figureOptions"]').click(function() {
        let activePaperType = [];
        if ($('#conference-check').prop("checked")) {
            $('#conference-check-label').css('background', '#359bd7');
            $('#conference-check-label').css('border', '0px');
            activePaperType.push('C');
        } else {
            $('#conference-check-label').css('background', '#fff');
            $('#conference-check-label').css('border', '1px solid #95a5a6');
        }

        if ($('#journal-check').prop("checked")) {
            $('#journal-check-label').css('background', '#359bd7');
            $('#journal-check-label').css('border', '0px');
            activePaperType.push('J');
        } else {
            $('#journal-check-label').css('background', '#fff');
            $('#journal-check-label').css('border', '1px solid #95a5a6');
        }
        
        console.log(activePaperType);
        currentPaperType = activePaperType;
        filterData();
    });

    // change the hardness toggle
    d3.select("#color-number").on('change', function() {
        numberVal = this.options[this.selectedIndex].value;
        if(numberVal == "20more"){
            minColorNum = 20;
            maxColorNum = 10000;
        }else if(this.selectedIndex == 0){
            minColorNum = -1;
            maxColorNum = 10000;
        }else{
            minColorNum = numberVal.split('-')[0];
            maxColorNum = numberVal.split('-')[1];
        }
        filterData();
    })

    $(".coding-icon").tooltip();
    $(".mode-icon").tooltip();
    $('input[name="imageType"]').unbind('click').click(function() {});
    $('input[name="imageType"]').click(function() {
        let activeimageType = [];
        $('.imageType').each(function() {
            let value = this.value;
            if ($('#' + value + '-check').is(":checked")) {
                activeimageType.push(value);
                $('#' + value + '-check-label').attr('class', 'selected-flat');
                $('#' + value + '-icon').attr('src', iconsAcUrlDic[value]);
            } else {
                $('#' + value + '-check-label').attr('class', 'unselected-flat');
                $('#' + value + '-icon').attr('src', iconsUrlDic[value]);
            }
        });
        currentimageTypes = activeimageType;
        //console.log(currentimageTypes);
        filterData();
    });

    $('input[name="usageType"]').unbind('click').click(function() {});
    $('input[name="usageType"]').click(function() {
        let activeusageType = [];
        $('.usageType').each(function() {
            let value = this.value;
            if ($('#' + value + '-check').is(":checked")) {
                activeusageType.push(value);
                $('#' + value + '-check-label').attr('class', 'selected-flat');
                $('#' + value + '-icon').attr('src', iconsAcUrlDic[value]);
            } else {
                $('#' + value + '-check-label').attr('class', 'unselected-flat');
                $('#' + value + '-icon').attr('src', iconsUrlDic[value]);
            }
        });
        currentusageTypes = activeusageType;
        //console.log(currentusageTypes);
        filterData();
    });

    $('input[name="legendType"]').unbind('click').click(function() {});
    $('input[name="legendType"]').click(function() {
        let activelegendType = [];
        $('.legendType').each(function() {
            let value = this.value;
            if ($('#' + value + '-check').is(":checked")) {
                activelegendType.push(value);
                $('#' + value + '-check-label').attr('class', 'selected-flat');
                $('#' + value + '-icon').attr('src', iconsAcUrlDic[value]);
            } else {
                $('#' + value + '-check-label').attr('class', 'unselected-flat');
                $('#' + value + '-icon').attr('src', iconsUrlDic[value]);
            }
        });
        currentlegendTypes = activelegendType;
        //console.log(currentlegendTypes);
        filterData();
    });

    $('input[name="mapType"]').unbind('click').click(function() {});
    $('input[name="mapType"]').click(function() {
        let activemapType = [];
        $('.mapType').each(function() {
            let value = this.value;
            if ($('#' + value + '-check').is(":checked")) {
                activemapType.push(value);
                $('#' + value + '-check-label').attr('class', 'selected-flat');
                $('#' + value + '-icon').attr('src', iconsAcUrlDic[value]);
            } else {
                $('#' + value + '-check-label').attr('class', 'unselected-flat');
                $('#' + value + '-icon').attr('src', iconsUrlDic[value]);
            }
        });
        currentmapTypes = activemapType;
        //console.log(currentlegendTypes);
        filterData();
    });

   


    //determine if used caption version

    $('input[name="captionCheck"]').unbind('click').click(function() {});
    $('input[name="captionCheck"]').click(function() {
        if ($('#caption-check').prop("checked")) {
            $('#caption-check-label').css('background', '#34495e');
            $('#caption-check-label').css('border', '0px');
            showCaption = 1;
        } else {
            $('#caption-check-label').css('background', '#fff');
            $('#caption-check-label').css('border', '1px solid #95a5a6');
            showCaption = 0;
        }


    });

    //filter years
    function yearString(number) {
        return number.toString();
    }



    //switch mode, image mode or paper mode
    $('#image-mode').unbind('click').click(function() {});
    $("#image-mode").click(function() {
        visMode = 1;
        ifAllImage = 1;
        $("#image-mode").css('border', 'solid 2px #333');
        $("#card-mode").css('border', '0px');
        $("#paper-mode").css('border', '0px');
        filterData();


    });
    $('#paper-mode').unbind('click').click(function() {});
    $("#paper-mode").click(function() {
        visMode = 2;
        ifAllImage = 0;
        $("#image-mode").css('border', '0px');
        $("#card-mode").css('border', '0px');
        $("#paper-mode").css('border', 'solid 2px #333');
        filterData();
    });

    $('#card-mode').unbind('click').click(function() {});
    $("#card-mode").click(function() {
        visMode = 3;
        ifAllImage = 0;
        $("#image-mode").css('border', '0px');
        $("#card-mode").css('border', 'solid 2px #333');
        $("#paper-mode").css('border', '0px');
        filterData();
    });


    //tooltip register
    $("#image-mode").tooltip();
    $("#paper-mode").tooltip();
    $("#card-mode").tooltip();
    //$("#image-size-slider").tooltip();

    //initialize the year slider
    $(".js-range-slider").ionRangeSlider({
        type: "double",
        grid: true,
        min: '1990',
        max: '2020',
        step: 1,
        skin: "square",
        prettify: yearString,
        onChange: function(data) {

        },
        onFinish: function(data) {
            // fired on every range slider update
            let leftVal = data.from;
            let rightVal = data.to;
            currentYearRange[0] = leftVal;
            currentYearRange[1] = rightVal;
            filterData();
        },
    });


    //present images
    if (visMode == 1) {
        ifAllImage = 1;
        filterData();
        //var currentData = G_IMG_DATA.slice(img_per_page * 0, img_per_page * 1);
        //presentImg(currentData, 0, 0, 1, 0);
    } else if (visMode == 2) {
        ifAllImage = 0;
        let img_count = G_PAP_DATA.length;
        let img_per_page = 20;
        let total_pages = Math.ceil(img_count / img_per_page);
        pageUI.pageTotal = total_pages;
        pageUI.pageAmount = img_per_page;
        pageUI.dataTotal = img_count;
        pageUI.getPage = function(page) {
            let currentData = G_PAP_DATA.slice(img_per_page * (page - 1), img_per_page * page);
            presentUPPapers(currentData, img_count);
        };
        pageUI.init();
        var currentData = G_PAP_DATA.slice(img_per_page * 0, img_per_page * 1);
        presentUPPapers(currentData, img_count);
    } else if (visMode == 3) {
        filterData();
    }
}


/**
 * filter the data given current conditions
 */
function filterData() {
    //update the interface
    if (visMode == 1) {

        //1. filtering data by conference
        var data = G_IMG_DATA;
        //var data = filterDataByConference(G_IMG_DATA, currentConferences);
        console.log(data);
        //data = filterDataByPaperType(data,currentPaperType);
        console.log(data);
        //2. filtering data by keywords, determine whether show year scent
        
        ifAllImage = 1;
        console.time("search begins");
        
        //4. filtering data by figure type (figure or table)

        data = filterDataByimageType(data, currentimageTypes);
        data = filterDataByusageType(data, currentusageTypes);
        data = filterDataBylegendType(data, currentlegendTypes);
        data = filterDataBymapType(data,currentmapTypes);
        console.log(data);
        //create the scent data
        countImageByYear(data);

        //5. filtering data by year
        let minYear = currentYearRange[0];
        let maxYear = currentYearRange[1];
        console.log(minYear);
        console.log(maxYear);
        data = filterDataByYear(data, minYear, maxYear);
        console.log(data);
        data = filterDataByNumber(data,minColorNum,maxColorNum);
        console.log(data);
        //6. reset year index dictionary
        resetYearIndexDic(data);


        var img_count = data.length;
        var total_pages = Math.ceil(img_count / img_per_page);

        pageUI.pageTotal = total_pages;
        pageUI.pageAmount = img_per_page;
        pageUI.dataTotal = img_count;
        pageUI.curPage = 1;
        pageUI.getPage = function(page) {
            let currentData = data.slice(img_per_page * (page - 1), img_per_page * page);
            presentImg(currentData, 0, 0, 1, 0);
        };
        pageUI.init();
        var currentData = data.slice(img_per_page * 0, img_per_page * 1);
        presentImg(currentData, 0, 0, 1, 0);
    } else if (visMode == 2) {
     
        //1. filtering data by conference
       
        // var data = filterDataByConference(G_IMG_FULL_DATA, currentConferences);
        
       // data = filterDataByPaperType(data,currentPaperType);
       
        //2. filtering data by keywords, determine whether show year scent
        
        ifAllImage = 1;
        
        //4. filtering data by figure type (figure or table)
        var data = filterDataByimageType(G_IMG_DATA, currentimageTypes);
        data - filterDataByusageType(data, currentusageTypes);
        data = filterDataBylegendType(data, currentlegendTypes);
        data = filterDataBymapType(data, currentmapTypes);
        data = filterDataByNumber(data,minColorNum,maxColorNum);
        //create the scent data
        countImageByYearPaperMode(data);

        //5. filtering data by year
        let minYear = currentYearRange[0];
        let maxYear = currentYearRange[1];
        data = filterDataByYear(data, minYear, maxYear);

        //6. reset year index dictionary
        resetYearIndexDic(data);
        var paperData = extractPaperData(data);

        ifAllImage = 0;
        let img_count = paperData.length;
        //paper_per_page = 20;
        let total_pages = Math.ceil(img_count / paper_per_page);
        pageUI.pageTotal = total_pages;
        pageUI.pageAmount = paper_per_page;
        pageUI.dataTotal = img_count;
        pageUI.curPage = 1;
        pageUI.getPage = function(page) {
            let currentData = paperData.slice(paper_per_page * (page - 1), paper_per_page * page);
            presentUPPapers(currentData, img_count);
        };
        pageUI.init();
        var currentData = paperData.slice(paper_per_page * 0, paper_per_page * 1);
        presentUPPapers(currentData, img_count);
    } else if (visMode == 3) {
        //1. filtering data by conference
        var data = filterDataByConference(G_IMG_FULL_DATA, currentConferences);
        console.log(data);
        data = filterDataByPaperType(data,currentPaperType);
        console.log(data);

        //2. filtering data by keywords, determine whether show year scent
        
        ifAllImage = 1;

        
        //4. filtering data by figure type (figure or table)
        data = filterDataByimageType(data, currentimageTypes);
        data = filterDataBylegendType(data, currentlegendTypes);
        data = filterDataByusageType(data, currentusageTypes);
        data = filterDataBymapType(data, currentmapTypes);
        data = filterDataByNumber(data,minColorNum,maxColorNum);
        //create the scent data
        countImageByYearPaperMode(data);

        //5. filtering data by year
        let minYear = currentYearRange[0];
        let maxYear = currentYearRange[1];
        data = filterDataByYear(data, minYear, maxYear);



        //6. reset year index dictionary
        resetYearIndexDic(data);
        var paperData = extractPaperData(data);

        ifAllImage = 0;
        let img_count = paperData.length;

        //group dataset by year
        let paperByYear = paperData.reduce((r, a) => {
            r[a.year] = [...r[a.year] || [], a];
            return r;
        }, {});

        presentPaperCards(paperByYear, img_count);
    }

}

/**
 * count image numbers by year
 */
function countImageByYear(data) {
    //console.log(scentData);
    //reset scent data
    Object.keys(scentData).forEach((d, i) => {
        scentData[d] = 0;
    });
    data.forEach((d, i) => {
        let year = d.year;
        scentData[year] += 1;
    })
    let minYear = currentYearRange[0];
    let maxYear = currentYearRange[1];
    //console.log(minYear, maxYear);
    scentDataArr = [];
    Object.keys(scentData).forEach((d, i) => {
        let subData = {};
        if (parseInt(d) >= minYear & parseInt(d) <= maxYear) {
            subData['year'] = d;
            subData['val'] = scentData[d];
            subData['ifSelected'] = 1;
        } else {
            subData['year'] = d;
            subData['val'] = scentData[d];
            subData['ifSelected'] = 0;
        }
        scentDataArr.push(subData);
    });
    //console.log(scentDataArr);
}

function countImageByYearPaperMode(data) {
    //console.log(scentData);
    //reset scent data
    Object.keys(scentData).forEach((d, i) => {
        scentData[d] = 0;
    });
    data.forEach((d, i) => {
        let year = d.year;
        if (d.paperImageName != 'N/A')
            scentData[year] += 1;
    })
    let minYear = currentYearRange[0];
    let maxYear = currentYearRange[1];
    //console.log(minYear, maxYear);
    scentDataArr = [];
    Object.keys(scentData).forEach((d, i) => {
        let subData = {};
        if (parseInt(d) >= minYear & parseInt(d) <= maxYear) {
            subData['year'] = d;
            subData['val'] = scentData[d];
            subData['ifSelected'] = 1;
        } else {
            subData['year'] = d;
            subData['val'] = scentData[d];
            subData['ifSelected'] = 0;
        }
        scentDataArr.push(subData);
    });
    //console.log(scentDataArr);
}

/**
 * reset the year index pair for image dataset
 * @param {} data 
 */
function resetYearIndexDic(data) {
    let lastYear = -1;
    yearPageDic = {};
    data.forEach((d, i) => {
        if (d['year'] != lastYear) {
            yearPageDic[d['year']] = Math.floor(i / 204) + 1;
            lastYear = d['year'];
        }
    });
}


function resetYearIndexDicPaper(data) {
    let lastYear = -1;
    yearPageDicPaper = {};
    data.forEach((d, i) => {
        if (d['year'] != lastYear) {
            yearPageDicPaper[d['year']] = Math.floor(i / 204) + 1;
            lastYear = d['year'];
        }
    });
}


/**
 * sort images by year
 * @param {} arr 
 */
function sortImageByYear(arr) {
    arr.sort(function(a, b) {
        let imageIDA = a.recodeRank;
        let imageIDB = b.recodeRank;
        return imageIDA - imageIDB;
    });
    return arr;
}


/**
 * group image data into 2D array, where axis = 0 is the paper, axis = 1 correspond to the images
 * @param {} imgData 
 */
function extractPaperData(imgData) {

    //console.log(imgData);

    var paperData = [];
    var paperDic = {};

    imgData.forEach((d, i) => {
        let paperTitle = d['paper_title'];
        if (paperTitle in paperDic) {
            // if (d['isUP'] == 1) {

            // }
            paperDic[paperTitle]['Figures'].push(d);
        } else {
            let subDataDic = {}; //store the paper information
            subDataDic['paper_title'] = d['paper_title'];
            subDataDic['conference'] = d['conference'];
            subDataDic['doi'] = d['doi'];
            subDataDic['paper_first'] = d['paper_first'];
            subDataDic['paper_last'] = d['paper_last'];
            subDataDic['paper_type'] = d['paper_type'];
            subDataDic['year'] = d['year'];
            subDataDic['isUP'] = d['isUP'];
            subDataDic['paper_url'] = d['paper_url'];
            subDataDic['paper_author'] = d['paper_author'];
            subDataDic['Figures'] = [d];
            // if (d['isUP'] == 1) {

            // }
            paperDic[paperTitle] = subDataDic;
        }
    });

    Object.keys(paperDic).forEach((d, i) => {
        paperData.push(paperDic[d]);
    });

    return paperData;

}


/**
 * convert the array of papers to object by paper doi
 * @param {Array} paperData - the array to store paper objects
 */
function stratifyPaperData(paperData) {
    var paperDic = {};
    paperData.forEach((d, i) => {
        doi = d.DOI;
        paperDic[doi] = d;
    })
    return paperDic;
}


/**
 * initialize global variables used in the program
 */
function initializeGlobalVariables() {
    for (let year = 1990; year < 2021; year++) {
        scentData[year] = 0;
        timelineStatus[year] = 0;
    }
}

/**
 * when starting a new search, all status for timeline should be reset
 */
function resetTimelineStatus() {
    for (let year = 1990; year < 2021; year++) {
        timelineStatus[year] = 0;
    }
}