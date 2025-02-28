// 加载状态管理
const loading = document.getElementById('loading');
const showLoading = () => loading.style.display = 'flex';
const hideLoading = () => loading.style.display = 'none';

// 初始化图表实例
const charts = {
    countyAnalysis: echarts.init(document.getElementById('countyAnalysis')),
    masterProfile: echarts.init(document.getElementById('masterProfile')),
    recruitmentTrend: echarts.init(document.getElementById('recruitmentTrend')),
    salesPerformance: echarts.init(document.getElementById('salesPerformance')),
    clinicProfile: echarts.init(document.getElementById('clinicProfile')),
    doctorProfile: echarts.init(document.getElementById('doctorProfile'))
};

// 数据加载和处理
async function loadData() {
    try {
        showLoading();
        const response = await fetch('./mock_data.json');
        const data = await response.json();
        if (!data || !data.counties) {
            throw new Error('数据格式不正确');
        }
        processAndVisualizeData(data);
        hideLoading();
    } catch (error) {
        console.error('数据加载失败:', error);
        hideLoading();
    }
}

// 初始化区域筛选
function initializeRegionFilter(data) {
    const regionFilter = document.getElementById('regionFilter');
    
    // 定义省份与区域的映射关系
    const provinceToRegion = {
        '北京市': 'north',
        '天津市': 'north',
        '河北省': 'north',
        '山西省': 'north',
        '内蒙古自治区': 'north',
        
        '辽宁省': 'northeast',
        '吉林省': 'northeast',
        '黑龙江省': 'northeast',
        
        '上海市': 'east',
        '江苏省': 'east',
        '浙江省': 'east',
        '安徽省': 'east',
        '福建省': 'east',
        '江西省': 'east',
        '山东省': 'east',
        
        '河南省': 'central',
        '湖北省': 'central',
        '湖南省': 'central',
        
        '广东省': 'south',
        '广西壮族自治区': 'south',
        '海南省': 'south',
        
        '重庆市': 'southwest',
        '四川省': 'southwest',
        '贵州省': 'southwest',
        '云南省': 'southwest',
        '西藏自治区': 'southwest',
        
        '陕西省': 'northwest',
        '甘肃省': 'northwest',
        '青海省': 'northwest',
        '宁夏回族自治区': 'northwest',
        '新疆维吾尔自治区': 'northwest'
    };

    // 获取数据中所有出现的区域
    const regions = new Set();
    if (data && data.counties) {
        data.counties.forEach(county => {
            const region = provinceToRegion[county.province];
            if (region) {
                regions.add(region);
            }
        });
    }

    // 区域名称映射
    const regionNames = {
        'all': '全部地区',
        'north': '华北地区',
        'northeast': '东北地区',
        'east': '华东地区',
        'central': '华中地区',
        'south': '华南地区',
        'southwest': '西南地区',
        'northwest': '西北地区'
    };

    // 生成选项
    const regionOptions = [
        { value: 'all', text: '全部地区' },
        ...Array.from(regions).map(region => ({
            value: region,
            text: regionNames[region] || region
        }))
    ];

    // 更新下拉菜单
    regionFilter.innerHTML = regionOptions
        .sort((a, b) => a.value === 'all' ? -1 : b.value === 'all' ? 1 : a.text.localeCompare(b.text))
        .map(option => `<option value="${option.value}">${option.text}</option>`)
        .join('');
}

// 数据处理和可视化
function processAndVisualizeData(data) {
    // 初始化区域筛选，传入 data 参数
    initializeRegionFilter(data);
    
    // 保存数据到全局变量，以便其他函数使用
    window.globalData = data;
    
    // 县域分析图表
    const countyOption = {
        title: {
            text: ''
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['成功案例', '整体平均']
        },
        xAxis: {
            type: 'category',
            data: ['GDP规模', '人口数量', '医疗机构数', '经济增速']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: '成功案例',
                type: 'bar',
                data: [320, 450, 80, 9.2]
            },
            {
                name: '整体平均',
                type: 'bar',
                data: [250, 380, 60, 7.5]
            }
        ]
    };
    charts.countyAnalysis.setOption(countyOption);

    // 县掌门画像分析
    const masterOption = {
        title: {
            text: ''
        },
        radar: {
            indicator: [
                { name: '医疗行业经验', max: 100},
                { name: '学历水平', max: 100},
                { name: '管理经验', max: 100},
                { name: '本地资源', max: 100},
                { name: '销售能力', max: 100}
            ]
        },
        series: [{
            type: 'radar',
            data: [
                {
                    value: [85, 90, 75, 95, 85],
                    name: '成功县掌门画像'
                }
            ]
        }]
    };
    charts.masterProfile.setOption(masterOption);

    // 处理优秀诊所数据
    const clinicStats = calculateClinicStats(data.clinics || []);
    console.log('诊所统计数据:', clinicStats); // 添加调试日志

    const clinicOption = {
        title: {
            text: '优秀诊所特征分析'
        },
        radar: {
            indicator: [
                { name: '日均接诊量', max: 100},
                { name: '医疗设备配置', max: 100},
                { name: '医生资质', max: 100},
                { name: '服务评分', max: 100},
                { name: '运营效率', max: 100}
            ],
            center: ['50%', '50%'],
            radius: '65%'
        },
        series: [{
            type: 'radar',
            data: [{
                value: [
                    normalizeValue(clinicStats.avgDailyPatients, 100), // 归一化处理
                    clinicStats.avgEquipmentLevel,
                    clinicStats.avgDoctorQualification,
                    clinicStats.avgServiceRating,
                    clinicStats.avgOperationEfficiency
                ],
                name: '优秀诊所画像',
                areaStyle: {
                    color: 'rgba(145, 204, 117, 0.4)'
                },
                lineStyle: {
                    color: '#91cc75'
                }
            }]
        }]
    };
    charts.clinicProfile.setOption(clinicOption);

    // 处理巡诊医生数据
    const doctorStats = calculateDoctorStats(data.doctors || []);
    console.log('医生统计数据:', doctorStats); // 添加调试日志

    const doctorOption = {
        title: {
            text: '优秀巡诊人员特征分布'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            max: 100
        },
        yAxis: {
            type: 'category',
            data: ['专业技能', '沟通能力', '服务态度', '效率表现', '团队协作'],
            axisLabel: {
                interval: 0
            }
        },
        series: [
            {
                type: 'bar',
                data: [
                    doctorStats.avgProfessionalSkills,
                    doctorStats.avgCommunication,
                    doctorStats.avgServiceAttitude,
                    doctorStats.avgEfficiency,
                    doctorStats.avgTeamwork
                ],
                itemStyle: {
                    color: '#5470c6'
                },
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{c}分'
                }
            }
        ]
    };
    charts.doctorProfile.setOption(doctorOption);

    // 招商趋势分析
    const recruitmentOption = {
        title: {
            text: ''
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: [25, 35, 45, 40, 55, 65],
            type: 'line',
            smooth: true
        }]
    };
    charts.recruitmentTrend.setOption(recruitmentOption);

    // 销售业绩分析
    const salesOption = {
        title: {
            text: ''
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: [150, 230, 280, 320, 400, 450],
            type: 'line',
            areaStyle: {}
        }]
    };
    charts.salesPerformance.setOption(salesOption);

    // 更新关键发现
    updateKeyFindings();
}

// 更新关键发现
function updateKeyFindings(filteredData = window.globalData) {
    if (!filteredData) return;  // 添加空值检查
    
    const keyFindings = document.getElementById('keyFindings');
    const findings = [
        `选定区域的平均GDP规模：${calculateAverageGDP(filteredData).toFixed(2)}亿元`,
        `医疗机构平均数量：${calculateAverageMedicalInstitutions(filteredData).toFixed(0)}家`,
        `平均人口规模：${calculateAveragePopulation(filteredData).toFixed(2)}万人`,
        '销售业绩呈现稳定上升趋势'
    ];

    keyFindings.innerHTML = findings.map(finding => `
        <div class="finding-card">
            <p>${finding}</p>
        </div>
    `).join('');
}

// 窗口大小改变时重置图表大小
window.addEventListener('resize', () => {
    Object.values(charts).forEach(chart => chart.resize());
});

// 初始化
document.addEventListener('DOMContentLoaded', loadData);

// 数据筛选处理
document.getElementById('timeRange').addEventListener('change', function() {
    // 根据选择的时间范围重新处理数据
    loadData();
});

// 修改区域筛选事件处理
document.getElementById('regionFilter').addEventListener('change', function() {
    const selectedRegion = this.value;
    // 使用全局数据变量
    const filteredData = filterDataByRegion(window.globalData, selectedRegion);
    // 更新图表显示
    updateCharts(filteredData);
});

// 修改数据筛选函数
function filterDataByRegion(data, region) {
    if (region === 'all') return data;
    
    // 定义省份与区域的映射关系（与上面相同）
    const provinceToRegion = {
        '北京市': 'north',
        '天津市': 'north',
        '河北省': 'north',
        '山西省': 'north',
        '内蒙古自治区': 'north',
        '辽宁省': 'northeast',
        '吉林省': 'northeast',
        '黑龙江省': 'northeast',
        '上海市': 'east',
        '江苏省': 'east',
        '浙江省': 'east',
        '安徽省': 'east',
        '福建省': 'east',
        '江西省': 'east',
        '山东省': 'east',
        '河南省': 'central',
        '湖北省': 'central',
        '湖南省': 'central',
        '广东省': 'south',
        '广西壮族自治区': 'south',
        '海南省': 'south',
        '重庆市': 'southwest',
        '四川省': 'southwest',
        '贵州省': 'southwest',
        '云南省': 'southwest',
        '西藏自治区': 'southwest',
        '陕西省': 'northwest',
        '甘肃省': 'northwest',
        '青海省': 'northwest',
        '宁夏回族自治区': 'northwest',
        '新疆维吾尔自治区': 'northwest'
    };

    // 筛选属于选定区域的县域数据
    const filteredCounties = data.counties.filter(county => 
        provinceToRegion[county.province] === region
    );

    // 返回筛选后的数据
    return {
        ...data,
        counties: filteredCounties
    };
}

// 添加更新图表的函数
function updateCharts(filteredData) {
    // 处理县域分析数据
    const countyStats = {
        success: {
            gdp: 0,
            population: 0,
            medical_institutions: 0,
            growth_rate: 0
        },
        average: {
            gdp: 0,
            population: 0,
            medical_institutions: 0,
            growth_rate: 0
        }
    };

    // 计算平均值
    if (filteredData.counties && filteredData.counties.length > 0) {
        const total = filteredData.counties.reduce((acc, county) => {
            acc.gdp += county.gdp;
            acc.population += county.population;
            acc.medical_institutions += county.medical_institutions;
            return acc;
        }, { gdp: 0, population: 0, medical_institutions: 0 });

        const count = filteredData.counties.length;
        countyStats.average.gdp = total.gdp / count;
        countyStats.average.population = total.population / count;
        countyStats.average.medical_institutions = total.medical_institutions / count;
    }

    // 更新县域分析图表
    const countyOption = {
        title: {
            text: '成功县域特征分布'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['成功案例', '整体平均']
        },
        xAxis: {
            type: 'category',
            data: ['GDP规模', '人口数量', '医疗机构数', '经济增速']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: '成功案例',
                type: 'bar',
                data: [
                    countyStats.average.gdp.toFixed(2),
                    countyStats.average.population.toFixed(2),
                    countyStats.average.medical_institutions.toFixed(0),
                    8.5 // 示例数据
                ]
            },
            {
                name: '整体平均',
                type: 'bar',
                data: [
                    (countyStats.average.gdp * 0.8).toFixed(2),
                    (countyStats.average.population * 0.8).toFixed(2),
                    (countyStats.average.medical_institutions * 0.8).toFixed(0),
                    6.5 // 示例数据
                ]
            }
        ]
    };
    charts.countyAnalysis.setOption(countyOption);

    // 更新县掌门画像分析
    const masterOption = {
        title: {
            text: '成功县掌门特征分析'
        },
        radar: {
            indicator: [
                { name: '医疗行业经验', max: 100},
                { name: '学历水平', max: 100},
                { name: '管理经验', max: 100},
                { name: '本地资源', max: 100},
                { name: '销售能力', max: 100}
            ]

        },
        series: [{
            type: 'radar',
            data: [
                {
                    value: [85, 90, 75, 95, 85],
                    name: '成功县掌门画像'
                }
            ]
        }]
    };
    charts.masterProfile.setOption(masterOption);

    // 更新招商趋势分析
    // 按月份统计销售数据
    const monthlyData = new Array(12).fill(0);
    if (filteredData.sales) {
        filteredData.sales.forEach(sale => {
            const month = new Date(sale.date).getMonth();
            monthlyData[month] += sale.amount;
        });
    }

    const recruitmentOption = {
        title: {
            text: '月度招商情况'
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: monthlyData.map(value => value.toFixed(2)),
            type: 'line',
            smooth: true
        }]
    };
    charts.recruitmentTrend.setOption(recruitmentOption);

    // 更新销售业绩分析
    const salesOption = {
        title: {
            text: '销售业绩趋势'
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: monthlyData.map(value => value.toFixed(2)),
            type: 'line',
            areaStyle: {}
        }]
    };
    charts.salesPerformance.setOption(salesOption);

    // 更新关键发现
    updateKeyFindings(filteredData);
}

// 辅助计算函数
function calculateAverageGDP(data) {
    if (!data || !data.counties || data.counties.length === 0) return 0;
    return data.counties.reduce((sum, county) => sum + county.gdp, 0) / data.counties.length;
}

function calculateAverageMedicalInstitutions(data) {
    if (!data || !data.counties || data.counties.length === 0) return 0;
    return data.counties.reduce((sum, county) => sum + county.medical_institutions, 0) / data.counties.length;
}

function calculateAveragePopulation(data) {
    if (!data || !data.counties || data.counties.length === 0) return 0;
    return data.counties.reduce((sum, county) => sum + county.population, 0) / data.counties.length;
}

// 添加数值归一化函数
function normalizeValue(value, max) {
    return (value / max) * 100;
}

// 修改计算诊所统计数据的函数
function calculateClinicStats(clinics) {
    if (!clinics || clinics.length === 0) {
        console.warn('没有诊所数据');
        return {
            avgDailyPatients: 0,
            avgEquipmentLevel: 0,
            avgDoctorQualification: 0,
            avgServiceRating: 0,
            avgOperationEfficiency: 0
        };
    }

    const total = clinics.reduce((acc, clinic) => ({
        avgDailyPatients: acc.avgDailyPatients + (clinic.daily_patients || 0),
        avgEquipmentLevel: acc.avgEquipmentLevel + (clinic.equipment_level || 0),
        avgDoctorQualification: acc.avgDoctorQualification + (clinic.doctor_qualification || 0),
        avgServiceRating: acc.avgServiceRating + (clinic.service_rating || 0),
        avgOperationEfficiency: acc.avgOperationEfficiency + (clinic.operation_efficiency || 0)
    }), {
        avgDailyPatients: 0,
        avgEquipmentLevel: 0,
        avgDoctorQualification: 0,
        avgServiceRating: 0,
        avgOperationEfficiency: 0
    });

    const count = clinics.length;
    console.log('诊所数量:', count); // 添加调试日志

    return {
        avgDailyPatients: Number((total.avgDailyPatients / count).toFixed(1)),
        avgEquipmentLevel: Number((total.avgEquipmentLevel / count).toFixed(1)),
        avgDoctorQualification: Number((total.avgDoctorQualification / count).toFixed(1)),
        avgServiceRating: Number((total.avgServiceRating / count).toFixed(1)),
        avgOperationEfficiency: Number((total.avgOperationEfficiency / count).toFixed(1))
    };
}

// 修改计算医生统计数据的函数
function calculateDoctorStats(doctors) {
    if (!doctors || doctors.length === 0) {
        console.warn('没有医生数据');
        return {
            avgProfessionalSkills: 0,
            avgCommunication: 0,
            avgServiceAttitude: 0,
            avgEfficiency: 0,
            avgTeamwork: 0
        };
    }

    const total = doctors.reduce((acc, doctor) => ({
        avgProfessionalSkills: acc.avgProfessionalSkills + (doctor.professional_skills || 0),
        avgCommunication: acc.avgCommunication + (doctor.communication || 0),
        avgServiceAttitude: acc.avgServiceAttitude + (doctor.service_attitude || 0),
        avgEfficiency: acc.avgEfficiency + (doctor.efficiency || 0),
        avgTeamwork: acc.avgTeamwork + (doctor.teamwork || 0)
    }), {
        avgProfessionalSkills: 0,
        avgCommunication: 0,
        avgServiceAttitude: 0,
        avgEfficiency: 0,
        avgTeamwork: 0
    });

    const count = doctors.length;
    console.log('医生数量:', count); // 添加调试日志

    return {
        avgProfessionalSkills: Number((total.avgProfessionalSkills / count).toFixed(1)),
        avgCommunication: Number((total.avgCommunication / count).toFixed(1)),
        avgServiceAttitude: Number((total.avgServiceAttitude / count).toFixed(1)),
        avgEfficiency: Number((total.avgEfficiency / count).toFixed(1)),
        avgTeamwork: Number((total.avgTeamwork / count).toFixed(1))
    };
}