<template>
  <div ref="body" class="body scrollbar-hidden">


<!--    <div class="head clearfix">-->
<!--      <h1 class="pulll_left">某公司大数据展示模版标题</h1>-->
<!--      <div class="menu menu2 pulll_left">-->
<!--        <ul>-->
<!--          <li><a href="https://gitee.com/iGaoWei/big-data-view">导航标题</a></li>-->
<!--          <li><a href="https://gitee.com/iGaoWei/big-data-view">导航标题样式</a></li>-->
<!--          <li><a href="https://gitee.com/iGaoWei/big-data-view">导航标题</a></li>-->
<!--          <li><a href="https://gitee.com/iGaoWei/big-data-view">导航标题</a></li>-->
<!--          <li><a href="https://gitee.com/iGaoWei/big-data-view">导航标题</a></li>-->
<!--          <li><a href="https://gitee.com/iGaoWei/big-data-view">导航标题</a></li>-->
<!--        </ul>-->
<!--      </div>-->
<!--      <div class="time" id="showTime">2018/6/12 17:00:12</div>-->
<!--    </div>-->


    <div class="mainbox" style="margin-top: 20px;">
      <ul class="clearfix nav1">
        <li style="width: 24%">
          <div class="box">
            <EchartsBar
                title="各事业部提案个数"
                :seriesData="[
                  {
                    name: '湖北龙腾',
                    type: 'pie',
                    data: [
                      { name: '湖北龙腾 20', value: 20 },
                      { name: '珠海龙昌 35', value: 35, selected: true }
                    ]
                  }
                ]"
                height="500px"
                :iSTooltip="true"
            />
          </div>
        </li>

        <li style="width: 24%">
          <div class="box">
            <EchartsBar
                title="各事业部提案节省金额"
                :series-data="[
                    {
                    name: '湖北龙腾',
                    type: 'pie',
                    data: [
                      { name: '湖北龙腾 138', value: 138, selected: true },
                      { name: '珠海龙昌 60', value: 60 }
                    ]
                  }
                ]"
                height="500px"
            />
          </div>
        </li>


        <li style="width: 26%">
          <div class="box">
            <EchartsBar
                title="各事业部每月提案个数"
                :x-axis-data="xAxisData0"
                :series-data="seriesData0"
                height="500px"
            />


          </div>
        </li>
        <li style="width: 26%">
          <div class="box">
            <EchartsBar
                title="各事业部每月提案节省金额"
                :x-axis-data="xAxisData0"
                :series-data="seriesData0"
                height="500px"
            />
          </div>
        </li>
        <li style="width: 73%;height: 845px;">
          <div class="box">
            <div class="tit">
              <t-button theme="primary" size="small" style="padding:0 3px;" >珠海</t-button>
              <t-button size="small"  variant="outline" style="padding:0 3px;" >湖北</t-button>
              事业部各部门月提案个数
            </div>
<!--          #409EFF   #67C23A #E6A23C #F56C6C #909399 #00B42A #722ED1 #13C2C2 #FF7D00 #5C7099 #D32F2F #34495E  -->
            <MultiAxisChart
                title=""
                :xAxisData="['制造一部', '制造二部', '制造三部', '品质部', '工艺部', '设备部', '财务部', '采购部', '研发部', '人力行政部', '经管中心', 'IT部', '市场部', '计划']"
                :yAxisConfig="[
                  { name: '', unit: 'ml', min: 0, max: 300},
                ]"
                :legendData="['1月', '2月', '3月', '4月', '5月']"
                :seriesList="[
                  { name: '1月', type: 'line', yAxisIndex: 0, color:'#409EFF', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0 ] },
                  { name: '2月', type: 'line', yAxisIndex: 0, color:'#67C23A', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
                  { name: '3月', type: 'line', yAxisIndex: 0, color:'#E6A23C', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
                  { name: '4月', type: 'line', yAxisIndex: 0, color:'#F56C6C', data: [0, 5 , 1,0,0,0,1,3,5,1,9,0,0,1] },
                  { name: '5月', type: 'line', yAxisIndex: 0, color:'#909399', data: [0, 10, 10, 10, 10,15,8, 5,6,1,3, 2,3,4 ] },
                ]"
                height="800px"
                :isxAxisTable="true"
            />
          </div>
        </li>
        <li style="width: 27%">
          <div class="box">
            <div class="tit">
              <t-button theme="primary" size="small" style="padding:0 3px;" >珠海</t-button>
              <t-button size="small"  variant="outline" style="padding:0 3px;" >湖北</t-button>
              事业部提案汇总
            </div>
            <MultiAxisChart
                title=""
                :xAxisData="['2026']"
                :yAxisConfig="[
                  { name: '', unit: 'ml', min: 0, max: 300},
                ]"
                :seriesList="[
                  { name: '制造一部', type: 'bar', yAxisIndex: 0, data: [100] },
                  { name: '制造二部', type: 'bar', yAxisIndex: 0, data: [95] },
                  { name: '品质部', type: 'bar', yAxisIndex: 0, data: [90] },
                  { name: '工艺部', type: 'bar', yAxisIndex: 0, data: [85] },
                  { name: '设备部', type: 'bar', yAxisIndex: 0, data: [80] },
                  { name: '工程部', type: 'bar', yAxisIndex: 0, data: [75] },
                  { name: '财务部', type: 'bar', yAxisIndex: 0, data: [70] },
                  { name: '采购部', type: 'bar', yAxisIndex: 0, data: [65] },
                  { name: '研发部', type: 'bar', yAxisIndex: 0, data: [60] },
                  { name: '人力资源', type: 'bar', yAxisIndex: 0, data: [55] },
                  { name: '经管中心', type: 'bar', yAxisIndex: 0, data: [50] },
                  { name: 'IT部', type: 'bar', yAxisIndex: 0, data: [45] },
                  { name: '计划', type: 'bar', yAxisIndex: 0, data: [40] },
                ]"
                height="800px"
            />
          </div>
        </li>
        <li style="width: 73%;height: 845px;">
          <div class="box">
            <div class="tit">事业部各部门月节省金额</div>
            <MultiAxisChart
                title=""
                :xAxisData="['制造一部', '制造二部', '制造三部', '品质部', '工艺部', '设备部', '财务部', '采购部', '研发部', '人力行政部', '经管中心', 'IT部', '市场部', '计划']"
                :yAxisConfig="[
                  { name: '', unit: 'ml', min: 0, max: 300},
                ]"
                :legendData="['1月', '2月', '3月', '4月', '5月']"
                :seriesList="[
                  { name: '1月', type: 'line', yAxisIndex: 0, color:'#409EFF', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0 ] },
                  { name: '2月', type: 'line', yAxisIndex: 0, color:'#67C23A', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
                  { name: '3月', type: 'line', yAxisIndex: 0, color:'#E6A23C', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
                  { name: '4月', type: 'line', yAxisIndex: 0, color:'#F56C6C', data: [0, 5 , 1,0,0,0,1,3,5,1,9,0,0,1] },
                  { name: '5月', type: 'line', yAxisIndex: 0, color:'#909399', data: [0, 10, 10, 10, 10,15,8, 5,6,1,3, 2,3,4 ] },
                ]"
                height="800px"
                :isxAxisTable="true"
            />

          </div>
        </li>
        <li style="width: 27%">
          <div class="box">
            <div class="tit">事业部各部门月节省金额汇总</div>
            <MultiAxisChart
                title=""
                :xAxisData="['2026']"
                :yAxisConfig="[
                  { name: '', unit: 'ml', min: 0, max: 300},
                ]"
                :seriesList="[
                  { name: '制造一部', type: 'bar', yAxisIndex: 0, data: [100] },
                  { name: '制造二部', type: 'bar', yAxisIndex: 0, data: [95] },
                  { name: '品质部', type: 'bar', yAxisIndex: 0, data: [90] },
                  { name: '工艺部', type: 'bar', yAxisIndex: 0, data: [85] },
                  { name: '设备部', type: 'bar', yAxisIndex: 0, data: [80] },
                  { name: '工程部', type: 'bar', yAxisIndex: 0, data: [75] },
                  { name: '财务部', type: 'bar', yAxisIndex: 0, data: [70] },
                  { name: '采购部', type: 'bar', yAxisIndex: 0, data: [55] },
                  { name: '研发部', type: 'bar', yAxisIndex: 0, data: [50] },
                  { name: '人力资源', type: 'bar', yAxisIndex: 0, data: [45] },
                  { name: '经管中心', type: 'bar', yAxisIndex: 0, data: [40] },
                  { name: 'IT部', type: 'bar', yAxisIndex: 0, data: [35] },
                  { name: '计划', type: 'bar', yAxisIndex: 0, data: [30] },
                ]"
                height="800px"
            />

          </div>
        </li>
        <li style="width: 73%;height: 845px">
          <div class="box">
            <div class="tit">珠海事业部各工序月提案个数</div>
            <MultiAxisChart
                title=""
                :xAxisData="['制造一部', '制造二部', '制造三部', '品质部', '工艺部', '设备部', '财务部', '采购部', '研发部', '人力行政部', '经管中心', 'IT部', '市场部', '计划']"
                :yAxisConfig="[
                  { name: '', unit: 'ml', min: 0, max: 300},
                ]"
                :legendData="['1月', '2月', '3月', '4月', '5月']"
                :seriesList="[
                  { name: '1月', type: 'line', yAxisIndex: 0, color:'#409EFF', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0 ] },
                  { name: '2月', type: 'line', yAxisIndex: 0, color:'#67C23A', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
                  { name: '3月', type: 'line', yAxisIndex: 0, color:'#E6A23C', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
                  { name: '4月', type: 'line', yAxisIndex: 0, color:'#F56C6C', data: [0, 5 , 1,0,0,0,1,3,5,1,9,0,0,1] },
                  { name: '5月', type: 'line', yAxisIndex: 0, color:'#909399', data: [0, 10, 10, 10, 10,15,8, 5,6,1,3, 2,3,4 ] },
                ]"
                height="800px"
                :isxAxisTable="true"
            />
          </div>
        </li>

        <li style="width: 27%">
          <div class="box">
            <div class="tit">珠海事业部各工序提案汇总</div>
            <MultiAxisChart
                title=""
                :xAxisData="['2026']"
                :yAxisConfig="[
                  { name: '', unit: 'ml', min: 0, max: 300},
                ]"
                :seriesList="[
                  { name: '制造一部', type: 'bar', yAxisIndex: 0, data: [100] },
                  { name: '制造二部', type: 'bar', yAxisIndex: 0, data: [95] },
                  { name: '品质部', type: 'bar', yAxisIndex: 0, data: [90] },
                  { name: '工艺部', type: 'bar', yAxisIndex: 0, data: [85] },
                  { name: '设备部', type: 'bar', yAxisIndex: 0, data: [80] },
                  { name: '工程部', type: 'bar', yAxisIndex: 0, data: [75] },
                  { name: '财务部', type: 'bar', yAxisIndex: 0, data: [70] },
                  { name: '采购部', type: 'bar', yAxisIndex: 0, data: [55] },
                  { name: '研发部', type: 'bar', yAxisIndex: 0, data: [50] },
                  { name: '人力资源', type: 'bar', yAxisIndex: 0, data: [45] },
                  { name: '经管中心', type: 'bar', yAxisIndex: 0, data: [40] },
                  { name: 'IT部', type: 'bar', yAxisIndex: 0, data: [35] },
                  { name: '计划', type: 'bar', yAxisIndex: 0, data: [30] },
                ]"
                height="800px"
            />
          </div>
        </li>

        <li style="width: 73%;height: 845px">
          <div class="box">
            <div class="tit">湖北事业部各工序提案个数</div>
            <MultiAxisChart
                title=""
                :xAxisData="['制造一部', '制造二部', '制造三部', '品质部', '工艺部', '设备部', '财务部', '采购部', '研发部', '人力行政部', '经管中心', 'IT部', '市场部', '计划']"
                :yAxisConfig="[
                  { name: '', unit: 'ml', min: 0, max: 300},
                ]"
                :legendData="['1月', '2月', '3月', '4月', '5月']"
                :seriesList="[
                  { name: '1月', type: 'line', yAxisIndex: 0, color:'#409EFF', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0 ] },
                  { name: '2月', type: 'line', yAxisIndex: 0, color:'#67C23A', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
                  { name: '3月', type: 'line', yAxisIndex: 0, color:'#E6A23C', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
                  { name: '4月', type: 'line', yAxisIndex: 0, color:'#F56C6C', data: [0, 5 , 1,0,0,0,1,3,5,1,9,0,0,1] },
                  { name: '5月', type: 'line', yAxisIndex: 0, color:'#909399', data: [0, 10, 10, 10, 10,15,8, 5,6,1,3, 2,3,4 ] },
                ]"
                height="800px"
                :isxAxisTable="true"
            />
          </div>
        </li>

        <li style="width: 27%">
          <div class="box">
            <div class="tit">湖北事业部各工序提案汇总</div>
            <MultiAxisChart
                title=""
                :xAxisData="['2026']"
                :yAxisConfig="[
                  { name: '', unit: 'ml', min: 0, max: 300},
                ]"
                :seriesList="[
                  { name: '制造一部', type: 'bar', yAxisIndex: 0, data: [100] },
                  { name: '制造二部', type: 'bar', yAxisIndex: 0, data: [95] },
                  { name: '品质部', type: 'bar', yAxisIndex: 0, data: [90] },
                  { name: '工艺部', type: 'bar', yAxisIndex: 0, data: [85] },
                  { name: '设备部', type: 'bar', yAxisIndex: 0, data: [80] },
                  { name: '工程部', type: 'bar', yAxisIndex: 0, data: [75] },
                  { name: '财务部', type: 'bar', yAxisIndex: 0, data: [70] },
                  { name: '采购部', type: 'bar', yAxisIndex: 0, data: [55] },
                  { name: '研发部', type: 'bar', yAxisIndex: 0, data: [50] },
                  { name: '人力资源', type: 'bar', yAxisIndex: 0, data: [45] },
                  { name: '经管中心', type: 'bar', yAxisIndex: 0, data: [40] },
                  { name: 'IT部', type: 'bar', yAxisIndex: 0, data: [35] },
                  { name: '计划', type: 'bar', yAxisIndex: 0, data: [30] },
                ]"
                height="800px"
            />
          </div>
        </li>

        <li style="width: 73%;height: 845px;">
          <div class="box">
            <div class="tit">珠海事业部提案节省金额</div>
            <MultiAxisChart
                title=""
                :xAxisData="['制造一部', '制造二部', '制造三部', '品质部', '工艺部', '设备部', '财务部', '采购部', '研发部', '人力行政部', '经管中心', 'IT部', '市场部', '计划']"
                :yAxisConfig="[
                  { name: '', unit: 'ml', min: 0, max: 300},
                ]"
                :legendData="['1月', '2月', '3月', '4月', '5月']"
                :seriesList="[
                  { name: '1月', type: 'line', yAxisIndex: 0, color:'#409EFF', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0 ] },
                  { name: '2月', type: 'line', yAxisIndex: 0, color:'#67C23A', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
                  { name: '3月', type: 'line', yAxisIndex: 0, color:'#E6A23C', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
                  { name: '4月', type: 'line', yAxisIndex: 0, color:'#F56C6C', data: [0, 5 , 1,0,0,0,1,3,5,1,9,0,0,1] },
                  { name: '5月', type: 'line', yAxisIndex: 0, color:'#909399', data: [0, 10, 10, 10, 10,15,8, 5,6,1,3, 2,3,4 ] },
                ]"
                height="800px"
                :isxAxisTable="true"
            />
          </div>
        </li>
        <li style="width: 27%">
          <div class="box">
            <div class="tit">珠海事业部提案节省金额 汇总</div>
            <MultiAxisChart
                title=""
                :xAxisData="['2026']"
                :yAxisConfig="[
                  { name: '', unit: 'ml', min: 0, max: 300},
                ]"
                :seriesList="[
                  { name: '制造一部', type: 'bar', yAxisIndex: 0, data: [100] },
                  { name: '制造二部', type: 'bar', yAxisIndex: 0, data: [95] },
                  { name: '品质部', type: 'bar', yAxisIndex: 0, data: [90] },
                  { name: '工艺部', type: 'bar', yAxisIndex: 0, data: [85] },
                  { name: '设备部', type: 'bar', yAxisIndex: 0, data: [80] },
                  { name: '工程部', type: 'bar', yAxisIndex: 0, data: [75] },
                  { name: '财务部', type: 'bar', yAxisIndex: 0, data: [70] },
                  { name: '采购部', type: 'bar', yAxisIndex: 0, data: [55] },
                  { name: '研发部', type: 'bar', yAxisIndex: 0, data: [50] },
                  { name: '人力资源', type: 'bar', yAxisIndex: 0, data: [45] },
                  { name: '经管中心', type: 'bar', yAxisIndex: 0, data: [40] },
                  { name: 'IT部', type: 'bar', yAxisIndex: 0, data: [35] },
                  { name: '计划', type: 'bar', yAxisIndex: 0, data: [30] },
                ]"
                height="800px"
            />
          </div>
        </li>

        <li style="width: 73%;height: 845px;">
          <div class="box">
            <div class="tit">湖北事业部提案节省金额</div>
            <MultiAxisChart
                title=""
                :xAxisData="['开料', '内层', '压合', '钻孔', '电镀VCP', '喷锡', '沉金', '成型', '表面处理', '测试', 'FQC', '包装', '外层线路层', '电镀', '文字', '防焊', '树脂塞孔', 'PQA', 'IPQC', 'IQC', '物化室', 'MRB', '客户', '体系', '成品仓', '物料仓']"
                :yAxisConfig="[
                  { name: '', unit: 'ml', min: 0, max: 300},
                ]"
                :legendData="['1月', '2月', '3月', '4月', '5月']"
                :seriesList="[
                  { name: '1月', type: 'line', yAxisIndex: 0, color:'#409EFF', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ] },
                  { name: '2月', type: 'line', yAxisIndex: 0, color:'#67C23A', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
                  { name: '3月', type: 'line', yAxisIndex: 0, color:'#E6A23C', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
                  { name: '4月', type: 'line', yAxisIndex: 0, color:'#F56C6C', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
                  { name: '5月', type: 'line', yAxisIndex: 0, color:'#909399', data: [0, 3000, 42667, 888, 654 , 3000, 24778, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000  ] },
                ]"
                height="800px"
                :isxAxisTable="true"
            />
          </div>
        </li>
        <li style="width: 27%">
          <div class="box">
            <div class="tit">湖北事业部提案节省金额 汇总</div>
            <MultiAxisChart
                title=""
                :xAxisData="['2026']"
                :yAxisConfig="[
                  { name: '', unit: 'ml', min: 0, max: 300},
                ]"
                :seriesList="[
                  { name: '内层', type: 'bar', yAxisIndex: 0, data: [42667] },
                  { name: '喷锡', type: 'bar', yAxisIndex: 0, data: [24778] },
                  { name: '开料', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: '电镀VCP', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: '沉金', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: '成型', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: '表面处理', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: '测试', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: 'FQC', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: '包装', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: '外层线路层', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: '电镀', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: '文字', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: '防焊', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: '树脂塞孔', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: '包装', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: 'PQA', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: 'IPQC', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: 'IQC', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: '物化室', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: 'MRB', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: '客户', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: '体系', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: '成品仓', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: '物料仓', type: 'bar', yAxisIndex: 0, data: [3000] },
                  { name: '压合', type: 'bar', yAxisIndex: 0, data: [888] },
                  { name: '钻孔', type: 'bar', yAxisIndex: 0, data: [654] },

                ]"
                height="800px"
            />
          </div>
        </li>
        <li style="width: 100%">
         <div class="box table-wrapper" >
<!--            <div class="tit" style="border-bottom:none;" >各事业部精益提案先进个人排名表</div>-->
            <div style="width: 49%;float:left; ">
              <div class="tit">各部门精益提案</div>
              <table class="table department" border="0" cellspacing="0" cellpadding="0"  >
                <thead>
                <tr>
                  <td rowspan="2">湖北事业部</td>
                  <td>制造一部<br/>制造二部</td>
                  <td>开料</td>
                  <td>压合</td>
                  <td>钻孔</td>
                  <td>沉铜/电镀</td>
                  <td>外层线路</td>
                  <td>防焊</td>
                  <td>文字</td>
                  <td>沉金</td>
                  <td>喷锡</td>
                  <td>成型</td>
                  <td>测试</td>
                  <td>FQC</td>
                  <td>FQA</td>
                  <td>包装</td>
                </tr>
                <tr>
                  <td >品质部</td>
                  <td >PQA</td>
                  <td >IPQC</td>
                  <td >IQC</td>
                  <td >物化室</td>
                  <td >MRB</td>
                  <td >客服</td>
                  <td >体系</td>
                  <td colspan="7"></td>
                </tr>
                <tr>
                  <td rowspan="2">珠海事业部</td>
                  <td >制造一部<br/>制造二部<br/>制造三部</td>
                  <td >开料</td>
                  <td >压合</td>
                  <td >钻孔</td>
                  <td >沉铜/电镀</td>
                  <td >外层线路</td>
                  <td >防焊</td>
                  <td >文字</td>
                  <td >沉金</td>
                  <td >喷锡</td>
                  <td >成型</td>
                  <td >测试</td>
                  <td >FQC</td>
                  <td >FQA</td>
                  <td >包装</td>
                </tr>
                <tr>
                  <td >品质部</td>
                  <td >PQA</td>
                  <td >IPQC</td>
                  <td >IQC</td>
                  <td >物化室</td>
                  <td >MRB</td>
                  <td >客服</td>
                  <td >体系</td>
                  <td colspan="8"></td>
                </tr>
                </thead>
              </table>
            </div>

          <div style="width: 50%;float: right;"  >
            <div class="tit">各事业部精益提案先进个人排名表</div>


            <table class="table ranking" border="0" cellspacing="0" cellpadding="0"  >
              <thead>
              <tr>
                <td colspan="7">各事业部精益提案先进个人排名表</td>
              </tr>
              <tr>
                <td>事业部</td>
                <td colspan="3">积极分子</td>
                <td colspan="3">价值创造者</td>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td>名次</td>
                <td>第一</td>
                <td>第二</td>
                <td>第三</td>
                <td>第一</td>
                <td>第二</td>
                <td>第三</td>
              </tr>
              <tr>
                <td>珠海</td>
                <td>张三10个</td>
                <td>李四8个</td>
                <td>王五5个</td>
                <td>张三20万</td>
                <td>张三10万</td>
                <td>张三5万</td>
              </tr>
              <tr>
                <td>湖北</td>
                <td>张三8个</td>
                <td>张三5个</td>
                <td>张三3个</td>
                <td>张三20万</td>
                <td>张三10万</td>
                <td>张三8万</td>
              </tr>
              </tbody>
            </table>

            </div>

            <div style="width: 100%;clear: both;">
                <div class="tit" style="clear: both;" >提案申请表内容</div>
              <table class="table" border="0" cellspacing="0" cellpadding="0"  >
                <thead>

                <tr>
                  <td rowspan="2">所属工厂</td>
                  <td rowspan="2">序号</td>
                  <td rowspan="2">工序</td>
                  <td rowspan="2">提案名称</td>
                  <td rowspan="2">提案人</td>
                  <td rowspan="2">提案类别</td>
                  <td rowspan="2">现状描述</td>
                  <td rowspan="2">计划改善方向</td>
                  <td rowspan="2">具体改进情况描述</td>
                  <td rowspan="2">理论投入</td>
                  <td rowspan="2">理论节约</td>
                  <td rowspan="2">理论年节省</td>
                  <td colspan="10">流程状态</td>
                </tr>
                <tr>
                  <td>流程节点</td>
                  <td>经管初审</td>
                  <td>投资回报可行性评估</td>
                  <td>技术可行性评估</td>
                  <td>综合评估</td>
                  <td>实施跟进</td>
                  <td>提案验收</td>
                  <td>奖励核算</td>
                  <td>奖励积分</td>
                  <td>奖励金额</td>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td>湖北龙腾</td>
                  <td>1</td>
                  <td>生产</td>
                  <td>提案名称</td>
                  <td>张三</td>
                  <td>效率提升</td>
                  <td>当前装配时间过长</td>
                  <td>引入自动化工具</td>
                  <td>已完成工具采购，正在调试</td>
                  <td>5000</td>
                  <td>8000</td>
                  <td>96000</td>
                  <td>✅️</td>
                  <td>✅️</td>
                  <td>✅️</td>
                  <td>️</td>
                  <td>️</td>
                  <td>️</td>
                  <td>️</td>
                  <td>️</td>
                  <td>️</td>
                  <td>️</td>
                </tr>
                </tbody>
              </table>
              <div style="height: 80px"></div>
            </div>
         </div>
        </li>




      </ul>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import siyi from "@/core/script/siyi.js";

import LineChart from "./LineChart.vue";
import MultiAxisChart from './MultiAxisChart.vue'
import YearChart from './YearChart.vue'


import EchartsBar from "./EchartsBar.vue";

const xAxisData0 = ['湖北龙腾', '珠海龙昌']

// 对应你图中的数据
const seriesData0 = [
  { name: '1月', type: 'bar', data: [10, 7] },
  { name: '2月', type: 'bar', data: [9, 8] },
  { name: '3月', type: 'bar', data: [8, 6] },
  { name: '4月', type: 'bar', data: [7, 11] },
  { name: '5月', type: 'bar', data: [5, 12] },
  { name: '6月', type: 'bar', data: [4, 13] },
  { name: '7月', type: 'bar', data: [3, 14] },
  { name: '8月', type: 'bar', data: [2, 15] },
  { name: '9月', type: 'bar', data: [3, 16] },
  { name: '10月', type: 'bar', data: [4, 17] },
  { name: '11月', type: 'bar', data: [5, 18] },
  { name: '12月', type: 'bar', data: [6, 19] },
]






onMounted(async () => {
  siyi.navHide = true;
})
</script>

<style scoped>
.body {
  background: no-repeat #063b88;
  background-size: cover;
  min-height: 100vh;
  min-width: 1600px;
  font-family: "微软雅黑";
  padding: 0;
  margin: 0;
  color: #fff;
  font-size: 16px;
  background: -webkit-radial-gradient(50% 35%, farthest-corner,#034f8e,#034987,#02366d,#002353);
  background: radial-gradient(50% 35%, farthest-corner,#034f8e,#034987,#02366d,#002353);
  overflow-y: auto !important;


@charset "utf-8";
  /* CSS Document */
  /**{
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box
  }
  html,body{min-height: 100%;}*/
  li{ list-style-type:none;}
  table{}

  i { margin: 0px; padding: 0px; text-indent: 0px; }
  img{ border:none; max-width: 100%;}
  a{ text-decoration:none; color:#fff;}
  a.active,a:focus{ outline:none!important; text-decoration:none;}
  ol,ul,p,h1,h2,h3,h4,h5,h6{ padding:0; margin:0}
  a:hover{ color:#06c; text-decoration: none!important}
  .clearfix:after, .clearfix:before {display: table;content: " "}
  .clearfix:after {clear: both}
  .pulll_left{float:left;}
  .pulll_right{float:right;}
  i{font-style: normal;}
  .text-w{color: #ffe400}
  .text-d{color: #ff6316}
  .text-s{color: #14e144}
  .text-b{color: #07e5ff}

  .head{position: relative; height: 90px; margin: 0 15px; padding-right: 60px;}
  .head h1{  font-size: 30px; letter-spacing: -2px; text-align: center; line-height: 90px; padding-right: 55px; color: #daf9ff;}
  .head .menu{}
  .head .menu ul{ font-size: 0;}

  .head .menu li{ display: inline-block; position: relative;margin: 30px 15px;;}
  .head .menu li a{ display: block; font-size: 18px; color: #fff; line-height: 30px; padding: 0 10px; }
  .head .time{position: absolute; right: 0; line-height: 90px; top: 0;}

  .menu li:before,
  .menu li:after{ position:absolute; width:10px; height:5px;opacity: .4; content: "";  border-top: 2px solid #02a6b5; top: -1px;border-radius: 2px;}
  .menu li:before,.menu li a:before{border-left: 2px solid #02a6b5;left: -1px;}
  .menu li:after,.menu li a:after{border-right: 2px solid #02a6b5; right: -1px;}
  .menu li a{ position:relative;}
  .menu li a:before,
  .menu li a:after{ position:absolute; width:10px; height:5px; opacity: .4;  content: "";border-bottom: 2px solid #02a6b5; bottom:-1px;border-radius: 2px;}

  .head .menu li a:hover{ color: #f4e925;}
  .menu li a:hover:before,
  .menu li a:hover:after,
  .menu li:hover:before,
  .menu li:hover:after{border-color:  #f4e925; opacity: 1;}

  .mainbox{padding: 0px 10px;}
  .nav1{margin-left: -6px; margin-right:-6px;}
  .nav1>li{padding:0 6px; float: left;}

  .box{ border:1px solid rgba(7,118,181,.5); box-shadow:inset 0 0 10px rgba(7,118,181,.4); margin-bottom: 12px; position: relative;}
  .tit{ padding: 10px 10px 10px 25px;border-bottom:1px solid rgba(7,118,181,.7);font-size: 16px; font-weight: 500; position: relative;}
  .tit:before,.tit01:before{position: absolute; content: ""; width: 6px; height: 6px; background: rgba(22,214,255,.9);box-shadow: 0 0 5px rgba(22,214,255,.9); border-radius: 10px; left: 10px; top: 18px;}

  .tit:after,.box:before{ width: 100%; height: 1px; content: ""; position: absolute; left: 0; bottom:-1px; background:linear-gradient(to right,#076ead,#4ba6e0,#076ead); box-shadow: 0 0 5px rgba(131,189,227,1); opacity: .6}
  .box:before{top: -1px;}

  .boxnav{padding: 10px; height: 390px;}
  .tit01{font-size: 16px; font-weight: 500; position: relative; padding-left: 15px;}
  .tit01:before{ left: 3px; top: 8px;}

  .mapc{background: no-repeat center center; background-size: 100% 100%}
  .map{position: relative; height: 100%; padding-left: 10%;}
  .map img{}
  .mapnav{position: absolute;z-index: 10;}

  .anchorBL{display: none;}
  .BMap_Marker img{border-radius: 30px; overflow: hidden; border:2px solid rgba(155,155,155,1)!important;}
  .zjia {margin-left: -10px; margin-right: -10px;}
  .zjia li{float: left; width: 33.33333%;padding: 15px 10px; text-align: center;}

  .zjia li img{width: 72px;  border-radius: 100px; margin: 0 auto; display: block; border: 2px solid rgba(255,255,255,.1); padding: 5px; }
  .zjia li h3{text-align: center; padding: 5px 0 0 0; font-size: 14px;}
  .zjia li span{ font-size: 12px;  display: inline-block; opacity: .4;}
  .zjia li p{ font-size: 14px; opacity: .6; line-height: 140%; display: -webkit-box; overflow: hidden; text-overflow: ellipsis; word-wrap: break-word; word-break: break-all; white-space: normal !important; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  }
}


.table{
  border-top:1px solid #b7c1ce;
  border-left: 1px solid #b7c1ce;
  font-size: 14px;
  text-align: center;
  width: 100%;
  //line-height: 25px;

  td {
    border-right: 1px solid #b7c1ce;
    border-bottom: 1px solid #b7c1ce;

    padding: 10px 10px;
    min-width: 50px;
  }




}

.lineh td{
  line-height: 36px;
}
.ranking td{
  line-height: 21px;
}
.one-line td{
  line-height: 30px;
}
.department td{
  cursor: pointer !important;
}

</style>