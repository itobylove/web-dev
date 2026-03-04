<template>
  <div class="box">
    <div class="costMain">
      <div class="baseData">
        <dl>
          <dt>客户名称<i class="ri-question-fill"/></dt>
          <dd>
            <t-select filterable></t-select>
          </dd>
        </dl>
        <dl>
          <dt>客户型号<i class="ri-question-fill"/></dt>
          <dd>
            <t-input/>
          </dd>
        </dl>
        <dl>
          <dt>客户物料号<i class="ri-question-fill"/></dt>
          <dd>
            <t-input/>
          </dd>
        </dl>
        <dl>
          <dt>STE尺寸<i class="ri-question-fill"/></dt>
          <dd>
            <t-input-adornment append="MM" style="width:150px">
              <t-input placeholder="长"/>
            </t-input-adornment>
            <t-input-adornment append="MM" style="width:150px">
              <t-input placeholder="宽"/>
            </t-input-adornment>
          </dd>
        </dl>
        <dl>
          <dt>工艺模板<i class="ri-question-fill"/></dt>
          <dd>
            <t-select filterable></t-select>
          </dd>
        </dl>
      </div>
      <div class="process">
        <dl>
          <dt class="title"><em>1</em><i class="ri-close-line"></i> 开料</dt>
          <dd class="content">
            <dl class="parameter">
              <dd class="name">板材型号<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input defaultValue="KB6160"/>
              </dd>
            </dl>
            <dl class="parameter">
              <dd class="name">板材厚度<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input-adornment  append="mm">
                  <t-input defaultValue="1"/>
                </t-input-adornment>
              </dd>
            </dl>
            <dl class="parameter">
              <dd class="name">铜厚<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input-adornment  append="UM">
                    <t-input defaultValue="18"/>
                </t-input-adornment>
              </dd>
            </dl>
            <dl class="assets">
              <dd class="name">设备组<i class="ri-question-fill"/></dd>
              <dd class="value">1#开料机</dd>
              <dd class="value active">2#开料机</dd>
            </dl>
          </dd>
          <dd class="operation">
            <span class="add">添加</span>
            <span class="del">删除</span>
          </dd>
        </dl>
        <dl>
          <dt class="title"><i>2</i>内层</dt>
          <dd class="content">
            <dl class="parameter">
              <dd class="name">最小线宽<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input-adornment  append="mm">
                <t-input defaultValue="0.2"/>
                </t-input-adornment>
              </dd>
            </dl>
            <dl class="parameter">
              <dd class="name">最小线距<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input-adornment  append="mm">
                <t-input defaultValue="0.1"/>
                </t-input-adornment>
              </dd>
            </dl>
            <dl class="assets">
              <dd class="name">设备组<i class="ri-question-fill"/></dd>
              <dd class="value">1#前处理线</dd>
              <dd class="value active">2#前处理线</dd>
              <dd class="value">3#前处理线</dd>
            </dl>
          </dd>
          <dd class="operation">
            <span class="add">添加</span>
            <span class="del">删除</span>
          </dd>
        </dl>
        <dl>
          <dt class="title"><i>3</i>压合</dt>
          <dd class="content">
            <dl class="parameter">
              <dd class="name">PP厚度<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input-adornment  append="mm">
                <t-input defaultValue="0.6"/>
                </t-input-adornment>
              </dd>
            </dl>
            <dl class="parameter">
              <dd class="name">PP型号<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input defaultValue=""/>
              </dd>
            </dl>
            <dl class="assets">
              <dd class="name">设备组<i class="ri-question-fill"/></dd>
              <dd class="value">1#压机</dd>
              <dd class="value active">2#压机</dd>
            </dl>
          </dd>
          <dd class="operation">
            <span class="add">添加</span>
            <span class="del">删除</span>
          </dd>
        </dl>
        <dl>
          <dt class="title"><i>4</i>钻孔</dt>
          <dd class="content">
            <dl class="parameter">
              <dd class="name">最小孔径<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input-adornment  append="mm">
                <t-input defaultValue="0.2"/>
                </t-input-adornment>
              </dd>
            </dl>
            <dl class="parameter">
              <dd class="name">总孔数<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input-adornment  append="个">
                <t-input defaultValue="32423"/>
                </t-input-adornment>
              </dd>
            </dl>
            <dl class="parameter">
              <dd class="name">叠板厚度<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input-adornment  append="">
                <t-input defaultValue="3"/>
                </t-input-adornment>
              </dd>
            </dl>
            <dl class="assets">
              <dd class="name">设备组<i class="ri-question-fill"/></dd>
              <dd class="value active">1#大族钻孔机组</dd>
              <dd class="value">2#激光钻孔机组</dd>
            </dl>
          </dd>
          <dd class="operation">
            <span class="add">添加</span>
            <span class="del">删除</span>
          </dd>
        </dl>
        <dl>
          <dt class="title"><i>5</i>沉铜</dt>
          <dd class="content">
            <dl class="parameter">
              <dd class="name">板材型号<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input defaultValue="KB6160"/>
              </dd>
            </dl>
            <dl class="parameter">
              <dd class="name">板材厚度<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input-adornment  append="mm">
                    <t-input defaultValue="1"/>
                </t-input-adornment>
              </dd>
            </dl>
            <dl class="parameter">
              <dd class="name">铜厚<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input-adornment  append="um">
                <t-input defaultValue="18"/>
                  </t-input-adornment>
              </dd>
            </dl>
            <dl class="assets">
              <dd class="name">设备组<i class="ri-question-fill"/></dd>
              <dd class="value">1#开料机</dd>
              <dd class="value active">2#开料机</dd>
            </dl>
          </dd>
          <dd class="operation">
            <span class="add">添加</span>
            <span class="del">删除</span>
          </dd>
        </dl>
        <dl>
          <dt class="title"><i>6</i>线路</dt>
          <dd class="content">
            <dl class="parameter">
              <dd class="name">最小线宽<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input-adornment  append="mm">
                <t-input defaultValue="0.2"/>
                  </t-input-adornment>
              </dd>
            </dl>
            <dl class="parameter">
              <dd class="name">最小线距<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input-adornment  append="mm">
                <t-input defaultValue="0.1"/>
                  </t-input-adornment>
              </dd>
            </dl>
            <dl class="assets">
              <dd class="name">设备组<i class="ri-question-fill"/></dd>
              <dd class="value">1#前处理线</dd>
              <dd class="value active">2#前处理线</dd>
              <dd class="value">3#前处理线</dd>
            </dl>
          </dd>
          <dd class="operation">
            <span class="add">添加</span>
            <span class="del">删除</span>
          </dd>
        </dl>
        <dl>
          <dt class="title"><i>7</i>阻焊</dt>
          <dd class="content">
            <dl class="parameter">
              <dd class="name">PP厚度<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input-adornment  append="mm">
                <t-input defaultValue="0.6"/>
                  </t-input-adornment>
              </dd>
            </dl>
            <dl class="parameter">
              <dd class="name">PP型号<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input defaultValue=""/>
              </dd>
            </dl>
            <dl class="assets">
              <dd class="name">设备组<i class="ri-question-fill"/></dd>
              <dd class="value">1#压机</dd>
              <dd class="value active">2#压机</dd>
            </dl>
          </dd>
          <dd class="operation">
            <span class="add">添加</span>
            <span class="del">删除</span>
          </dd>
        </dl>
        <dl>
          <dt class="title"><i>8</i>字符</dt>
          <dd class="content">
            <dl class="parameter">
              <dd class="name">最小孔径<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input-adornment  append="mm">
                <t-input defaultValue="0.2"/>
                  </t-input-adornment>
              </dd>
            </dl>
            <dl class="parameter">
              <dd class="name">总孔数<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input-adornment  append="个">
                <t-input defaultValue="32423"/>
                  </t-input-adornment>
              </dd>
            </dl>
            <dl class="parameter">
              <dd class="name">叠板厚度<i class="ri-question-fill"/></dd>
              <dd class="value">
                <t-input defaultValue="3"/>
              </dd>
            </dl>
            <dl class="assets">
              <dd class="name">设备组<i class="ri-question-fill"/></dd>
              <dd class="value active">1#大族钻孔机组</dd>
              <dd class="value">2#激光钻孔机组</dd>
            </dl>
          </dd>
          <dd class="operation">
            <span class="add">添加</span>
            <span class="del">删除</span>
          </dd>
        </dl>
      </div>
      <div class="costList">
        <div class="steps">
          <dl v-for="(text,id) in obj.stepList" @click="obj.scrollTo(id)" :class="[{active:refObj.step===id}]">
            <dd></dd>
            <dt>{{ text }}</dt>
          </dl>
        </div>
        <div class="list">
          <div id="step1">
            <div class="title">BOM成本</div>
            <div class="s">
              <div class="siyi-table header">
                <table>
                  <tbody>
                  <tr>
                    <td>类型</td>
                    <td>项目</td>
                    <td>单价</td>
                    <td>数量</td>
                    <td>金额</td>
                  </tr>
                  <tr>
                    <td>板材</td>
                    <td>KB6160 1.2MM 1/1 OZ</td>
                    <td>160元</td>
                    <td>30张</td>
                    <td>4800元</td>
                  </tr>
                  <tr>
                    <td>油墨</td>
                    <td>...</td>
                    <td>...</td>
                    <td>...</td>
                    <td>...</td>
                  </tr>
                  <tr>
                    <td>干膜</td>
                    <td>...</td>
                    <td>...</td>
                    <td>...</td>
                    <td>...</td>
                  </tr>
                  <tr>
                    <td>铜球</td>
                    <td>...</td>
                    <td>...</td>
                    <td>...</td>
                    <td>...</td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div id="step2">
            <div class="title">工序成本</div>
            <div class="s">
              <div class="siyi-table header">
                <table>
                  <tbody>
                  <tr>
                    <td>类型</td>
                    <td>费率</td>
                    <td>费用</td>
                  </tr>
                  <tr>
                    <td>直接折旧</td>
                    <td>...</td>
                    <td>...</td>
                  </tr>
                  <tr>
                    <td>租赁间接折旧</td>
                    <td>...</td>
                    <td>...</td>

                  </tr>
                  <tr>
                    <td style="width: 270px">辅助生产材料/低值易耗</td>
                    <td>...</td>
                    <td>...</td>

                  </tr>
                  <tr>
                    <td> 其他工序固定</td>
                    <td>...</td>
                    <td>...</td>

                  </tr>
                  </tbody>
                </table>
              </div>


            </div>
          </div>
          <div id="step3">
            <div class="title">外发成本</div>
            <div class="s">
              <div class="siyi-table header">
                <table>
                  <tbody>
                  <tr>
                    <td>类型</td>
                    <td>费率</td>
                    <td>费用</td>
                  </tr>
                  <tr>
                    <td>电金</td>
                    <td>...</td>
                    <td>...</td>
                  </tr>
                  <tr>
                    <td>选化OSP</td>
                    <td>...</td>
                    <td>...</td>

                  </tr>

                  </tbody>
                </table>
              </div>

            </div>
          </div>
          <div id="step4">
            <div class="title">公摊成本</div>
            <div class="s">

              <div class="siyi-table header">
                <table>
                  <tbody>
                  <tr>
                    <td>类型</td>
                    <td>费率</td>
                    <td>费用</td>
                  </tr>
                  <tr>

                    <td>环保费用</td>
                    <td>...</td>
                    <td>...</td>
                  </tr>
                  <tr>
                    <td>公设费用</td>
                    <td>...</td>
                    <td>...</td>

                  </tr>

                  </tbody>
                </table>
              </div>

            </div>
          </div>
          <div id="step5">
            <div class="title">销管财费用</div>
            <div class="s">
              <div class="siyi-table header">
                <table>
                  <tbody>
                  <tr>
                    <td>类型</td>
                    <td>费率</td>
                    <td>费用</td>
                  </tr>
                  <tr>
                    <td>销售费用</td>
                    <td>...</td>
                    <td>...</td>
                  </tr>
                  <tr>
                    <td>管理费用</td>
                    <td>...</td>
                    <td>...</td>

                  </tr>
                  <tr>
                    <td>财务费用</td>
                    <td>...</td>
                    <td>...</td>

                  </tr>

                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="costResult">
      <dl>
        <dt>订单数量</dt>
        <dd>
          <input type="number" value="3000">
        </dd>
      </dl>
      <dl>
        <dt>预留毛利率</dt>
        <dd>
          <input type="text" value="20%">
        </dd>
      </dl>
      <dl>
        <dt>增值税率</dt>
        <dd>
          <input type="text" value="13%">
        </dd>
      </dl>
      <dl>
        <dt>其他税费</dt>
        <dd>
          <input type="text" value="6%">
        </dd>
      </dl>
      <dl>
        <dt>报废+预投率</dt>
        <dd>
          <input type="text" value="6%">
        </dd>
      </dl>
      <dl>
        <dt>平米价</dt>
        <dd>972.23 元/平米</dd>
      </dl>
      <dl>
        <dt>PCS价</dt>
        <dd>1.23 元/PCS</dd>
      </dl>
      <dl>
        <dt>总金额</dt>
        <dd>4123.13 元</dd>
      </dl>
    </div>
  </div>
</template>
<script setup>
import {nextTick, reactive} from 'vue';

const refObj = reactive({
  step: 'step1'
});


const obj = {
  stepList: {
    step1: 'BOM成本',
    step2: '工序成本',
    step3: '外发成本',
    step4: '公摊成本',
    step5: '销管财费用',
  },
  scrollTo: id => {
    nextTick(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({behavior: 'smooth'});
        refObj.step = id;
      }
    });
  }
};

</script>
<style scoped>
.box {
  width: 100%;
  height: 100%;
  padding: 5px;
  background-color: #edf0f6;
  display: flex;
  flex-direction: column;
  gap: 5px;



    > .costMain {
      overflow: hidden;
      flex: 1;
      display: flex;
      flex-direction: row;
      flex-shrink: 0;
      gap: 2px;

      > .baseData {
        overflow: hidden;
        border-radius: 5px;
        background-color: #fff;
        flex-shrink: 0;

        > dl {
          padding: 5px 20px;
          display: flex;

          > dt {
            min-width: 120px;
            padding-right: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;

            > i {
              color: #828282;
              flex-shrink: 0;

              &:hover {
                color: #35a1fd;
              }
            }
          }

          > dd {
            flex: 1;
            display: flex;
            gap: 5px;
          }
        }
      }

      > .process {
        border-radius: 5px;
        background-color: #fff;
        overflow: hidden auto;
        flex: 1;
        flex-shrink: 0;

        &::-webkit-scrollbar {
          display: none;
        }

        > dl {
          border-bottom: 1px dashed #ececec;
          display: flex;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background-color: #fcfdff;

            > .title > em {
              color: #e5e5e5;
            }

            > .title > i {
              color: #e5e5e5;
            }

            > .operation > span {
              display: block;
            }
          }

          > .title {
            min-width: 140px;
            border-right: 1px dashed #ececec;
            font-weight: bold;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;

            > em {
              font-size: 30px;
              color: #f1f1f1;
              font-weight: bold;
              position: absolute;
              left: 5px;
              bottom: 5px;
              flex-shrink: 0;
            }

            > i {
              color: #f1f1f1;
              font-size: 18px;
              position: absolute;
              top: 5px;
              left: 5px;

              &:hover {
                color: #ff2e2e;
              }
            }
          }

          > .content {
            padding: 5px 0;
            flex: 1;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;

            > dl {
              flex: 1;
              display: flex;
              align-items: center;
              flex-shrink: 0;

              > dd {
                height: 36px;
                display: flex;
                align-items: center;
                flex-shrink: 0;
              }

              > .name {
                min-width: 140px;
                padding: 0 10px;
                justify-content: space-between;

                > i {
                  color: #828282;

                  &:hover {
                    color: #35a1fd;
                  }
                }
              }

              > .unit {
                width: 50px;
                justify-content: center;
              }
            }

            > .assets {
              > .value {
                height: 30px;
                padding: 0 10px;
                border: 1px solid #e3e3e3;
                border-radius: 3px;
                margin-right: 5px;
                cursor: default;

                &:last-child {
                  margin-right: 0;
                }

                &:hover, &.active {
                  color: #FFF;
                  background-color: #35a1fd;
                  border: 1px solid #1b97ff;
                }
              }
            }
          }

          > .operation {
            padding: 0 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 2px;
            flex-shrink: 0;

            > span {
              cursor: default;
              border-radius: 2px;
              padding: 5px 10px;
              color: #FFF;
              background-color: #35a1fd;
            }

            > .del {
              background-color: #ff2e2e;
            }

            > .add {
              background-color: #00a400;
            }
          }
        }
      }


    > .costList {
      width: 550px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 5px;
      flex-shrink: 0;

      > .steps {
        height: 70px;
        border-radius: 5px;
        background-color: #fff;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 30px;
        flex-shrink: 0;

        > dl {
          cursor: default;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          > dd {
            width: 18px;
            height: 18px;
            border: 6px solid #c6c9ce;
            border-radius: 50%;
            background-color: #FFF;
            flex-shrink: 0;
          }

          > dt {
            line-height: 28px;
            color: #333;
            font-size: 14px;
            flex-shrink: 0;
          }

          &.active {
            > dd {
              border: 5px solid #c6c9ce;
            }

            > dt {
              color: #35a1fd;
              font-weight: bold;
            }
          }
        }
      }

      > .list {
        border-radius: 5px;
        background-color: #fff;
        overflow: hidden auto;
        flex: 1;
        flex-shrink: 0;

        &::-webkit-scrollbar {
          display: none;
        }

        > div {
          > .title {
            height: 40px;
            line-height: 40px;
            border-bottom: 1px dashed #ededed;
            font-weight: bold;
            padding: 0 5px;
          }

          > .s {
            min-height: 100px;
            background-color: #FFF;
          }
        }
      }
    }
    }
  > .costResult {
    height: 100px;
    border-radius: 5px;
    background-color: #fff;
    padding-right: 20px;
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: right;

    > dl {
      display: flex;
      flex-direction: column;
      padding: 0 15px;

      > dt {
        height: 40px;
        line-height: 40px;
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        color: #3a3a3a;
      }

      > dd {
        height: 40px;
        line-height: 40px;
        text-align: center;
        font-size: 40px;
        color: #00d500;
        font-weight: bold;

        > input {
          width: 120px;
          height: 40px;
          padding: 0;
          margin: 0;
          border: 0;
          outline: none;
          background-color: transparent;
          text-align: center;
          font-weight: bold;
          font-size: 36px;
          color: #35a1fd;
          border-bottom: 1px dashed #dddddd;
          display: block;
        }
      }
    }
  }
}
</style>
