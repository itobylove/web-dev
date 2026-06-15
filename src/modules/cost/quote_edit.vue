<template>
  <div class="main-body">
      <div class="form-box" v-if="baseForm.isInit">
        <t-divider size="15px">订单信息</t-divider>

        <t-form ref="quoteRef" :rules="baseForm.quoteRules" :data="baseForm.quote"  label-width="150px" label-align="left" required-mark-position="left" >

          <t-form-item name="plant_id_order">
            <template #label>{{dData.FORM_TITLE_MAP['plant_id_order']}}<i class="ri-question-fill"/></template>
            <t-select :popup-props="{'overlayClassName':'select-option-center'}" v-model="baseForm.quote.plant_id_order" :options="plantList" :defaultValue="siyi.user.plantId" />
          </t-form-item>


          <t-form-item name="plant_id_make">
            <template #label>{{dData.FORM_TITLE_MAP['plant_id_make']}}<i class="ri-question-fill"/></template>
            <t-select :popup-props="{'overlayClassName':'select-option-center'}" v-model="baseForm.quote.plant_id_make"
                      @change="(value, context)=>baseFormEvent.change(value, context,'plant_id_make')"
                      :options="plantList" :defaultValue="siyi.user.plantId" />
          </t-form-item>

          <t-form-item name="sale_type">
            <template #label>{{dData.FORM_TITLE_MAP['sale_type']}}<i class="ri-question-fill"/></template>
            <t-select :popup-props="{'overlayClassName':'select-option-center'}" v-model="baseForm.quote.sale_type"
                      @change="(value, context)=>baseFormEvent.change(value, context,'sale_type')"
                      :options="vData.select_options.sale_type"  />
          </t-form-item>

          <t-form-item name="business_region">
            <template #label>{{dData.FORM_TITLE_MAP['business_region']}}<i class="ri-question-fill"/></template>
            <t-select :popup-props="{'overlayClassName':'select-option-center'}" v-model="baseForm.quote.business_region"
                      @change="(value, context)=>baseFormEvent.change(value, context,'business_region')"
                      :options="vData.select_options.business_region"  />
          </t-form-item>

          <t-form-item name="product_code">
            <template #label><span @dblclick="baseFormEvent.getMi">{{dData.FORM_TITLE_MAP['product_code']}}</span> <i class="ri-question-fill"/></template>
<!--            <t-input align="center" v-model="baseForm.quote.product_code" @change="(value, context)=>baseFormEvent.change(value, context,'product_code')" />-->

            <t-select ref="jobSelectorRef" v-model="baseForm.quote.product_code" empty="请输入本厂型号（至少5位）" clearable
                       filterable  @search="baseFormEvent.jobSearch" :options="vData.select_options.product_code"
                       @change="(value, context)=>baseFormEvent.change(value, context,'product_code')" />


          </t-form-item>


          <t-form-item name="customer_name">
            <template #label>{{dData.FORM_TITLE_MAP['customer_name']}}<i class="ri-question-fill"/></template>
            <!--            <t-select class=my-selector v-model="baseForm.quote.customer_id" filterable />-->
            <t-input align="center" v-model="baseForm.quote.customer_name" />
          </t-form-item>

          <t-form-item name="cust_product_name">
            <template #label>{{dData.FORM_TITLE_MAP['cust_product_name']}}<i class="ri-question-fill"/></template>
            <t-input align="center" v-model="baseForm.quote.cust_product_name" />
          </t-form-item>


          <t-form-item name="cust_product_code">
            <template #label>{{dData.FORM_TITLE_MAP['cust_product_code']}}<i class="ri-question-fill"/></template>
            <t-input align="center" v-model="baseForm.quote.cust_product_code" />
          </t-form-item>

          <t-form-item name="pcs_length">
            <template #label>{{dData.FORM_TITLE_MAP['pcs_length']}}<i class="ri-question-fill"/></template>
            <t-input-number  v-model="baseForm.quote.pcs_length"
                             @change="(value, context)=>baseFormEvent.change(value, context,'pcs_length')"
                             align="center"  :min=baseForm.quote.pcs_width min="2" step="0.01" suffix="mm"  style="width: 100% "/>
          </t-form-item>

          <t-form-item name="pcs_width">
            <template #label>{{dData.FORM_TITLE_MAP['pcs_width']}}<i class="ri-question-fill"/></template>
            <t-input-number  v-model="baseForm.quote.pcs_width"
                             @change="(value, context)=>baseFormEvent.change(value, context,'pcs_width')"
                             align="center"   min="2" step="0.01" :max="baseForm.quote.pcs_length" suffix="mm"  style="width: 100% "/>
          </t-form-item>



          <t-form-item name="pcs_num">
            <template #label>{{dData.FORM_TITLE_MAP['pcs_num']}}<i class="ri-question-fill"/></template>
            <t-input-number  v-model="baseForm.quote.pcs_num"
                             @change="(value, context)=>baseFormEvent.change(value, context,'pcs_num')"
                             align="center"  :min="1" step="1" style="width: 100% "/>
          </t-form-item>

        </t-form>


        <t-divider size="15px">工程资料</t-divider>

        <t-form ref="paramsRef" :rules="baseForm.paramsRules" @submit="baseFormEvent.submit" label-width="150px" label-align="left" required-mark-position="left" :data="baseForm.params">

          <t-form-item name="package_id_base">
            <template #label>{{dData.FORM_TITLE_MAP['package_id_base']}}<i class="ri-question-fill"/></template>
            <t-radio-group name="package_id_base"  theme="button" v-model="baseForm.params.package_id_base" :options="vData.select_options.packages_base"
                           @change="(value,context)=>baseFormEvent.change(value,context,'package_id_base')" />
          </t-form-item>

          <t-form-item name="package_id_service" v-show="baseForm.params.package_id_base">
            <template #label>{{dData.FORM_TITLE_MAP['package_id_service']}}<i class="ri-question-fill"/></template>
            <t-select :popup-props="{'overlayClassName':'select-option-center'}" filterable v-model="baseForm.params.package_id_service"
                      :options="vData.select_options.packages_service.filter(item=>item.data.pid===baseForm.params.package_id_base)"
                      @change="(value,context)=>baseFormEvent.change(value,context,'package_id_service')" />

          </t-form-item>

          <t-form-item name="features">
            <template #label>{{dData.FORM_TITLE_MAP['features']}}<i class="ri-question-fill"/></template>
            <t-check-tag-group v-bind="dData.check_group_bind" v-model="baseForm.params.features"
                               @change="(value,context)=>baseFormEvent.change(value,context,'features')"
                               :options="vData.select_options.features" />
          </t-form-item>

          <t-form-item name="layerNum">
            <template #label>{{dData.FORM_TITLE_MAP['layerNum']}}<i class="ri-question-fill"/></template>
            <t-input-number align="center"  v-model="baseForm.params.layerNum"
                            @change="(value,context)=>baseFormEvent.change(value,context,'layerNum')"
                            v-bind="baseForm.bind.layerNum" suffix="　层" style="width: 100%" />
          </t-form-item>

          <t-form-item name="thickness">
            <template #label>{{dData.FORM_TITLE_MAP['thickness']}}<i class="ri-question-fill"/></template>
            <t-input-number align="center"  v-model="baseForm.params.thickness"
                            min="0.01" step="0.01" max="8" suffix="MM" style="width: 100%" />
          </t-form-item>

          <t-form-item name="coreThickness" v-if="baseForm.params.layerNum > 2 || typeof baseForm.params.layerNum!=='number' ">
            <template #label>{{dData.FORM_TITLE_MAP['coreThickness']}}<i class="ri-question-fill"/></template>
            <t-input-number align="center"  v-model="baseForm.params.coreThickness"
                            @change="(value,context)=>baseFormEvent.change(value,context,'coreThickness')"
                            min="0.01" step="0.01" max="8" suffix="MM" style="width: 100%" />
          </t-form-item>

          <t-form-item name="minTraceWidth">
            <template #label>{{dData.FORM_TITLE_MAP['minTraceWidth']}}<i class="ri-question-fill"/></template>
            <t-input-number align="center"  v-model="baseForm.params.minTraceWidth"  min="0" step="0.01" max="1" suffix="MM" style="width: 100%" />
          </t-form-item>

          <t-form-item name="minTraceSpacing">
            <template #label>{{dData.FORM_TITLE_MAP['minTraceSpacing']}}<i class="ri-question-fill"/></template>
            <t-input-number align="center"  v-model="baseForm.params.minTraceSpacing"  min="0" step="0.01" max="1" suffix="MM" style="width: 100%" />
          </t-form-item>

          <t-form-item name="minDrillSize">
            <template #label>{{dData.FORM_TITLE_MAP['minDrillSize']}}<i class="ri-question-fill"/></template>
            <t-input-number align="center"  v-model="baseForm.params.minDrillSize"  min="0.01" step="0.01" max="3" suffix="MM" style="width: 100%" />
          </t-form-item>

          <t-form-item name="copperThickness">
            <template #label>{{dData.FORM_TITLE_MAP['copperThickness']}}<i class="ri-question-fill"/></template>
            <t-input-number align="center"  v-model="baseForm.params.copperThickness"
                            min="0.01" step="0.01" max="140" suffix="um" style="width: 100%" />
          </t-form-item>

          <t-form-item name="innerCopperThickness" v-if="baseForm.params.layerNum>2">
            <template #label>{{dData.FORM_TITLE_MAP['innerCopperThickness']}}<i class="ri-question-fill"/></template>
            <t-input-number align="center"  v-model="baseForm.params.innerCopperThickness"
                            min="0.01" step="0.01" max="140" suffix="um" style="width: 100%" />
          </t-form-item>

          <t-form-item name="mechBlindBuriedViaLayers" v-if="vData.package_service?.label?.includes('机械盲')">
            <template #label>{{dData.FORM_TITLE_MAP['mechBlindBuriedViaLayers']}}<i class="ri-question-fill"/></template>
            <t-input-number align="center"  v-model="baseForm.params.mechBlindBuriedViaLayers"  min="1"  suffix="　层" style="width: 100%" />
          </t-form-item>


          <t-form-item name="finishType">
            <template #label>{{dData.FORM_TITLE_MAP['finishType']}}<i class="ri-question-fill"/></template>
            <t-select :popup-props="{'overlayClassName':'select-option-center'}" v-model="baseForm.params.finishType" filterable :options="vData.select_options.finishType" />
          </t-form-item>


          <t-form-item name="testingItems">
            <template #label>{{dData.FORM_TITLE_MAP['testingItems']}}<i class="ri-question-fill"/></template>
            <t-select :popup-props="{'overlayClassName':'select-option-center'}" v-model="baseForm.params.testingItems" multiple filterable :options="vData.select_options.testingItems"
                      @change="(value,context)=>baseFormEvent.change(value,context,'testingItems')" />
          </t-form-item>

<!--          <t-form-item name="useAVI">
            <template #label>{{dData.FORM_TITLE_MAP['useAVI']}}<i class="ri-question-fill"/></template>
            <t-radio-group  theme="button" v-model="baseForm.params.useAVI"  :options="vData.select_options.useAVI"/>
          </t-form-item>-->


          <t-form-item name="isResinPlugging">
            <template #label>{{dData.FORM_TITLE_MAP['isResinPlugging']}}<i class="ri-question-fill"/></template>
            <t-radio-group  theme="button" v-model="baseForm.params.isResinPlugging"  :options="vData.select_options.isResinPlugging"/>
          </t-form-item>

          <t-form-item name="isBuriedCopper">
            <template #label>{{dData.FORM_TITLE_MAP['isBuriedCopper']}}<i class="ri-question-fill"/></template>
            <t-radio-group theme="button" v-model="baseForm.params.isBuriedCopper" :options="vData.select_options.isBuriedCopper"
                           @change="(value,context)=>baseFormEvent.change(value,context,'isBuriedCopper')" />
          </t-form-item>

          <t-form-item name="isXQYJ">
            <template #label>{{dData.FORM_TITLE_MAP['isXQYJ']}}<i class="ri-question-fill"/></template>
            <t-radio-group theme="button" v-model="baseForm.params.isXQYJ" :options="vData.select_options.isXQYJ"/>
          </t-form-item>

          <t-form-item name="profileType">
            <template #label>{{dData.FORM_TITLE_MAP['profileType']}}<i class="ri-question-fill"/></template>
            <t-radio-group theme="button" v-model="baseForm.params.profileType" :options="vData.select_options.profileType"/>
          </t-form-item>

          <t-form-item name="goldFingerType">
            <template #label>{{dData.FORM_TITLE_MAP['goldFingerType']}}<i class="ri-question-fill"/></template>
            <t-radio-group theme="button" v-model="baseForm.params.goldFingerType" :options="vData.select_options.goldFingerType"/>
          </t-form-item>

          <t-form-item name="XBType">
            <template #label>{{dData.FORM_TITLE_MAP['XBType']}}<i class="ri-question-fill"/></template>
            <t-radio-group theme="button" v-model="baseForm.params.XBType" :options="vData.select_options.XBType"/>
          </t-form-item>



          <t-form-item name="drillType">
            <template #label>{{dData.FORM_TITLE_MAP['drillType']}}<i class="ri-question-fill"/></template>
            <t-radio-group theme="button" v-model="baseForm.params.drillType"
                           @change="(value,context)=>baseFormEvent.change(value,context,'AAAA')"
                           :options="vData.select_options.drillType"/>
          </t-form-item>



          <t-form-item name="vDrillMultipleType">
            <template #label>{{dData.FORM_TITLE_MAP['vDrillMultipleType']}}<i class="ri-question-fill"/></template>
            <t-check-tag-group v-bind="dData.check_group_bind" v-model="baseForm.params.vDrillMultipleType"
                               @change="(value,context)=>baseFormEvent.change(value,context,'vDrillMultipleType')"
                               :options="vData.select_options.vDrillMultipleType" />
          </t-form-item>

          <t-form-item name="vDrillMultipleType2">
            <template #label>{{dData.FORM_TITLE_MAP['vDrillMultipleType2']}}<i class="ri-question-fill"/></template>
            <t-check-tag-group v-bind="dData.check_group_bind" v-model="baseForm.params.vDrillMultipleType2"
                               @change="(value,context)=>baseFormEvent.change(value,context,'vDrillMultipleType2')"
                               :options="vData.select_options.vDrillMultipleType2" />
          </t-form-item>


          <t-form-item name="fontMultipleType">
            <template #label>{{dData.FORM_TITLE_MAP['fontMultipleType']}}<i class="ri-question-fill"/></template>
            <t-check-tag-group v-bind="dData.check_group_bind" v-model="baseForm.params.fontMultipleType"
                               @change="(value,context)=>baseFormEvent.change(value,context,'fontMultipleType')"
                               :options="vData.select_options.fontMultipleType" />
          </t-form-item>


          <t-form-item name="checkTools">
            <template #label>{{dData.FORM_TITLE_MAP['checkTools']}}<i class="ri-question-fill"/></template>
            <t-check-tag-group v-bind="dData.check_group_bind" v-model="baseForm.params.checkTools"
                               @change="(value,context)=>baseFormEvent.change(value,context,'checkTools')"
                               :options="vData.select_options.checkTools" />
          </t-form-item>



          <t-form-item >
            <t-button type="submit"> 提交</t-button>
          </t-form-item>

        </t-form>


      </div>
      <div  class="process-box"  style="position: relative"  >
        <div class="process-empty" v-if="packages_items.length===0">
          <t-empty title="请填写参数后提交" />
        </div>
        <template v-else>
            <div class="process-list">
               <div class="process-li"  v-for="(packages_item,index) in packages_items" v-show="packages_item.parameters.length>0 || processBox.detailMode">
                 <div class="title">
                   <span>{{index+1}}. {{packages_item.process.name}}</span>
                   <em>{{packages_item.item.package_name}}</em>
                 </div>
                 <div class="content">
                   <div class="parameters">
                     <template v-for="(parameter,parameter_index) in packages_item.parameters" >

                      <!--  特殊参数  -->
                       <div v-if="parameter.plugin_name" class="parameter-item" :id="'parameter-'+index+'-'+parameter_index"  :class="['parameter','parameter_'+parameter.plugin_name]" :style="parameter?.row_style" >

                         <div class="title" >{{parameter.name}}
                           <t-tooltip  theme="primary" :content="parameter.remark" placement="top" :overlay-style="{ width: '500px' }" show-arrow>
                             <i class="ri-magic-line icon-important"/>
                           </t-tooltip>
                         </div>


                      <!--   物料组件  -->
                         <div class="content-wrap"   v-if="parameter.plugin_name===dData.plugin_name.material_code && parameter.material_list" >

                           <div title="物料组件-按钮" v-show="!parameter.plugin_params?.material_max || parameter.plugin_params?.material_max>1"  class="content material-title">
                             <div :style="parameter.is_readonly?'width: 215px':'width: 150px'">物料名称</div>
                             <div v-show="!parameter.is_readonly" style="width: 60px">物料数量</div>
                             <div style="width: 130px">{{ parameter.material_list[0]?.['num']?.['name'] || '物料用量' }}</div>
                           </div>

                           <div title="物料组件" class="content"  v-for="(parameter_material,material_index) in parameter.material_list" >
                              <span  class="parameter_btn" v-show="!parameter.plugin_params?.material_max || parameter.plugin_params?.material_max>1">
                                <i class="ri-subtract-line" v-show="material_index>0"  @click="processEvent.removeMaterial(parameter,material_index)"/>
                                <i class="ri-add-line" @click="processEvent.addMaterial(parameter,material_index)"/>
                              </span>

                             <t-select title="物料选择" v-model="parameter_material.code.value"
                                       v-if="parameter_material.code.plugin_name===dData.plugin_name.material_code"
                                       :title="parameter_material.code?.material?.label || ''"
                                       :options="parameter_material.code.select_options || []"
                                       :status="parameter_material.num.input_options?.required && (!parameter_material.code?.price || !parameter_material.code?.value) ?'error':'default' "
                                       @focus="()=>processEvent.getMaterialList(parameter,packages_item,material_index)"
                                        readonly class="parameter_material.code_code"
                                       :popup-props="{'overlayClassName':'select-option-center'}" :style="parameter.is_readonly?'width: 215px':'width: 150px'"
                                       v-bind="parameter_material.code.input_options || {}" />

                             <t-input-number title="物料数量"  v-model="parameter_material.num.ratio" v-show="!parameter.is_readonly" align="center"
                                 @change="()=>processEvent.getMaterialNum(parameter,packages_item,material_index,true)"
                                  class="parameter_material_ratio" theme="normal" min="1" step="1" max="9" style="width: 60px" />

                             <t-input-number title="物料用量" v-model="parameter_material.num.value"
                                             class="parameter_material_num" align="center" theme="normal"
                                             :suffix="parameter_material.num.unit_name" readonly
                                             :title="parameter_material.num.name+' : '+parameter_material.num.value+' '+parameter_material.num.unit_name"
                                             :status="parameter_material.num.input_options?.required && (!parameter_material.num?.ratio || !parameter_material.num?.value) ?'error':'default' "
                                             @focus="()=>processEvent.getMaterialNum(parameter,packages_item,material_index)"
                                             :decimalPlaces="parameter_material.num.decimal_places"
                                             style="width: 130px" v-bind="parameter_material.num.input_options || {}" />

                           </div>
                         </div>

                         <div v-else  title="普通组件" class="content" >
                           <t-input-number align="center" :title="parameter.value+parameter.unit_name"
                                           v-model="parameter.value"
                                           :suffix="parameter.unit_name" theme="normal"
                                           :readonly="Boolean(parameter.is_readonly)"
                                           :status="parameter.input_options?.required && ( parameter.value==='' || parameter.value===null) ?'error':'default' "
                                           @focus="()=>processEvent.getParameter(parameter,packages_item)"
                                           @change="()=>processEvent.change(parameter)"
                                           :decimalPlaces="parameter.decimal_places"
                                           style="width: 350px" v-bind="parameter.input_options || {}"/>
                         </div>
                       </div>


                    <!--   普通参数   -->
                       <div  v-else v-show="processBox.detailMode || !parameter.is_readonly" :id="'parameter-'+index+'-'+parameter_index"  class="parameter" :style="parameter?.row_style"  >
                         <div class="title" >{{parameter.name}}
                           <t-tooltip  theme="primary" :content="parameter.remark" placement="top" :overlay-style="{ width: '500px' }" show-arrow>
                             <i class="ri-question-fill"/>
                           </t-tooltip>
                         </div>
                         <div class="content">

                           <t-input align="center" v-if="parameter.input_type===dData.input_type.TEXT"
                                    v-model="parameter.value"
                                    @change="()=>processEvent.change(parameter)"
                                    :status="parameter.input_options?.required && ( parameter.value==='' || parameter.value===null) ?'error':'default' "
                                    :defaultValue="parameter.default_value" :disabled="Boolean(parameter.is_readonly)"
                                    :suffix="parameter.unit_name"
                                    placeholder="请输入文本" style="width: 350px" v-bind="parameter.input_options || {}"/>

                           <t-input-number align="center" v-if="parameter.input_type===dData.input_type.NUMBER"
                                           v-model="parameter.value"
                                           :defaultValue="parameter.default_value" :disabled="Boolean(parameter.is_readonly)"
                                           :suffix="parameter.unit_name"
                                           @change="()=>processEvent.change(parameter)"
                                           :status="parameter.input_options?.required && ( parameter.value==='' || parameter.value===null) ?'error':'default' "
                                           :placeholder="'请输入'+(parameter.value_type===dData.value_type.INT?'整数':'数字')"
                                           theme="normal"
                                           :decimalPlaces="parameter.value_type===dData.value_type.FLOAT ? (parameter.decimal_places || undefined):0"
                                           style="width: 350px" v-bind="parameter.input_options || {}"/>

                           <t-select :popup-props="{'overlayClassName':'select-option-center'}"
                                     v-if="[dData.input_type.SELECT,dData.input_type.RADIO].includes(parameter.input_type)"
                                     v-model="parameter.value"
                                     :defaultValue="parameter.default_value" :disabled="Boolean(parameter.is_readonly)"
                                     filterable
                                     :creatable="!!parameter?.creatable"
                                     @create="(value)=>processEvent.createOptions(value,parameter)"
                                     :options="parameter.select_options || []"
                                     :status="parameter.input_options?.required && ( parameter.value==='' || parameter.value===null || parameter.value===[]) ?'error':'default' "
                                     @change="()=>processEvent.change(parameter)"
                                     :multiple="parameter.input_type===dData.input_type.SELECT"
                                     style="width: 350px" v-bind="parameter.input_options || {}"/>

                           <t-switch v-if="parameter.input_type==='switch'" v-model="parameter.value"
                                     @change="()=>processEvent.change(parameter)"
                                     :status="parameter.input_options?.required && ( parameter.value==='' || parameter.value===null) ?'error':'default' "
                                     :defaultValue="parameter.default_value" :disabled="Boolean(parameter.is_readonly)"
                                     :customValue="parameter.select_options || ['是', '否']" :label="parameter.select_options || ['是', '否']" size="large"
                                     v-bind="parameter.input_options || {}"/>
                         </div>
                       </div>

                     </template>

                   </div>
                   <div class="assets" v-if="processBox.detailMode" >
                     <t-radio-group v-for="(asset_groups,index) in packages_item.asset_group_list"
                                    v-model="packages_item.item.asset_group_id[index]" theme="button"
                                    :defaultValue="asset_groups[0]?.value" :options="asset_groups"
                                    @change="costEvent.updateAllCost()"/>
                   </div>
                   <div v-else style="width: 150px"></div>
                 </div>
               </div>
            </div>
            <div class="process-btn">
              <t-button type="button" :theme="materialPriceBox.isChanged?'warning':'primary'"   @click="materialPriceEvent.show()" style="margin-right: 30px"> 物料调价</t-button>
              <t-button type="button"  :theme="resultBox.isError?'warning':'primary'"  @click="resultEvent.save()"> 保存</t-button>
            </div>
            <div class="process-nav" >
              <t-button v-for="item in processBox.navList" v-show="item.show()" variant="outline" :title="item.title"
                        @click="processEvent.navClick(item.key)">
                      <i :class="item.icon" :style="item?.style"></i>
              </t-button>
            </div>
        </template>
      </div>
      <div class="cost-box scrollbar-hidden">
        <TableComponent   v-if="costTable.isShow"  ref="costTableRef" v-bind="costTableEvent.bind()"/>
        <template  v-else>
          <div class="steps scrollbar-hidden">
<!--            <dl  class="stepMenu" style="background-color: #eee; padding: 2px 10px; color: #000; border-radius: 5px;">
              <dd style="border: 6px solid #0f95fb;"></dd>
              <dt>总成本</dt>
              <dt class="stepDesc">平米成本：1111.2元</dt>
              <dt class="stepDesc">PCS成本：5.123元</dt>
            </dl>-->
            <dl v-for="(text,id) in dData.stepList" @click="costList.scrollTo(id)" :class="['stepMenu',{active:costList.step===id}]">
              <dd></dd>
              <dt>{{ text }} </dt>
<!--              <dt class="stepDesc">1111</dt>-->
<!--              <dt class="stepDesc">1111</dt>-->
            </dl>
            <span class="cost-table-switcher" @click="costTableEvent.show()"><i class="ri-table-3"></i></span>
          </div>

            <div class="list" v-if="costList.isInit">

              <div id="step_bom">
                <div class="title collapse" @click="costEvent.collapse('bom')">BOM成本</div>
                <div class="cost-items">
                  <div class="siyi-table header">
                    <table>
                      <tbody>
                      <tr @click="costEvent.collapse('bom')" class="collapse">
                        <td>类型</td>
                        <td class="bom-name">规格</td>
                        <td>物料单价</td>
<!--                        <td>PCS耗量</td>-->
                        <td>订单耗量(含预投)</td>
<!--                        <td>PCS成本</td>-->
                        <td>订单成本(含预投)</td>
                        <td>平米成本(毛面积)</td>
                      </tr>

                      <tr v-show="!costItems.bom.collapse"
                          v-for="item in costItems.bom.list" :title="item.desc">
                        <td>{{item.name}}</td>
                        <td class="bom-name">{{item.title}}</td>
                        <td :class="{ 'price-rate': item.priceRate !== 1 }" :title="`费率${item.priceRate}倍`">
                          {{roundNum(item.price,4,6,1)}}   {{item.rmb || '元'}} / {{item.unit}}</td>
<!--                        <td>{{roundNum(item.pcs_used,4,6,1)}}   {{item.unit}}</td>-->
                        <td>{{roundNum(item.order_used_overage,4,6,1)}}   {{item.unit}}</td>
<!--                        <td>{{roundNum(item.pcs_price,4,6,1)}}   {{item.rmb}}</td>-->
                        <td>{{roundNum(item.order_price_overage,4,6,1)}} {{item.rmb}}</td>
                        <td>{{roundNum(item.square_price_gross_overage,4,6,1)}} {{item.rmb}}</td>
                      </tr>
                      <tr @click="costEvent.collapse('bom')" class="collapse">
                        <td colspan="4">合计</td>
<!--                        <td>{{roundNum((costItems.bom?.pcs_price || 0)+(costItems.bom_ext?.pcs_price || 0),2,4)}} 元</td>-->
                        <td>{{roundNum((costItems.bom?.order_price_overage || 0)+(costItems.bom_ext?.order_price_overage || 0),2,4)}} 元</td>
                        <td>{{roundNum((costItems.bom?.square_price_gross_overage || 0)+(costItems.bom_ext?.square_price_gross_overage || 0),2,4)}} 元</td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>


              <div id="step_process_dynamic">
                <div class="title collapse" @click="costEvent.collapse('process_dynamic')">{{dData.stepList.process_dynamic}} </div>
                <div class="cost-items">
                  <div class="siyi-table header">
                    <table>
                      <tbody>
                      <tr @click="costEvent.collapse('process_dynamic')" class="collapse">
                        <td>类型</td>
                        <td class="cost-item-title">名称</td>
                        <td>单价</td>
<!--                        <td>耗量(PCS)</td>-->
<!--                        <td>订单耗量</td>-->
                        <td>订单耗量(含预投)</td>
<!--                        <td>PCS成本</td>-->
<!--                        <td>平米成本</td>-->
                        <td>订单成本(含预投)</td>
                        <td>平米成本(含预投)</td>
                      </tr>
                      <tr v-show="!costItems.process_dynamic.collapse" v-for="item in costItems.process_dynamic.list">
                        <td>{{item.name}}</td>
                        <td class="cost-item-title">{{item.title}}</td>
                        <td>{{roundNum(item.price,4,4)}}  {{item.rmb}} / {{item.unit}}</td>
<!--                        <td>{{roundNum(item.pcs_used,4,4)}} {{item.unit}}</td>-->
<!--                        <td>{{roundNum(item.order_used,4,4)}}   {{item.unit}}</td>-->
                        <td>{{roundNum(item.order_used_overage,4,4)}}   {{item.unit}}</td>
<!--                        <td>{{roundNum(item.pcs_price,4,4)}} {{item.rmb}}</td>-->
<!--                        <td>{{ item.square_price_gross}} {{item.rmb}}</td>-->
                        <td>{{roundNum(item.order_price_overage,4,4)}}   {{item.rmb}}</td>
                        <td>{{roundNum(item.square_price_gross_overage,4,4)}}   {{item.rmb}}</td>
                      </tr>
                      <tr @click="costEvent.collapse('process_dynamic')" class="collapse">
                        <td colspan="4">合计</td>
                        <!--                        <td>{{roundNum(costItems.process_dynamic?.pcs_price ,4,4)}} 元</td>-->
                        <!--                        <td>{{roundNum(costItems.process_dynamic?.square_price_gross || 0 ,4,4)}} 元</td>-->
                        <td>{{roundNum(costItems.process_dynamic?.order_price_overage || 0 ,2,4)}} 元</td>
                        <td>{{roundNum(costItems.process_dynamic?.square_price_gross_overage || 0 ,2,4)}} 元</td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>


              <div id="step_process_static">
                <div class="title collapse" @click="costEvent.collapse('process_static')">{{dData.stepList.process_static}}  </div>
                <div class="cost-items">
                  <div class="siyi-table header">
                    <table>
                      <tbody>
                      <tr @click="costEvent.collapse('process_static')" class="collapse">
                        <td>类型</td>
                        <td class="cost-item-title">名称</td>
                        <td>单价</td>
                        <!--                        <td>耗量(PCS)</td>-->
<!--                        <td>订单耗量</td>-->
                        <td>订单耗量(含预投)</td>
                        <!--                        <td>PCS成本</td>-->
                        <!--                        <td>平米成本</td>-->
                        <td>订单成本(含预投)</td>
                        <td>平米成本(含预投)</td>
                      </tr>
                      <tr v-show="!costItems.process_static.collapse" v-for="item in costItems.process_static.list">
                        <td>{{item.name}}</td>
                        <td class="cost-item-title">{{item.title}}</td>
                        <td>{{roundNum(item.price,4,4)}}  {{item.rmb}} / {{item.unit}}</td>
                        <!--                        <td>{{roundNum(item.pcs_used,4,4)}} {{item.unit}}</td>-->
<!--                        <td>{{roundNum(item.order_used,4,4)}}   {{item.unit}}</td>-->
                        <td>{{roundNum(item.order_used_overage,4,4)}}   {{item.unit}}</td>
                        <!--                        <td>{{roundNum(item.pcs_price,4,4)}} {{item.rmb}}</td>-->
                        <!--                        <td>{{ item.square_price_gross}} {{item.rmb}}</td>-->
                        <td>{{roundNum(item.order_price_overage,4,4)}}   {{item.rmb}}</td>
                        <td>{{roundNum(item.square_price_gross_overage,4,4)}}   {{item.rmb}}</td>
                      </tr>
                      <tr @click="costEvent.collapse('process_static')" class="collapse">
                        <td colspan="4">合计</td>
                        <!--                        <td>{{roundNum(costItems.process_static?.pcs_price ,4,4)}} 元</td>-->
                        <!--                        <td>{{roundNum(costItems.process_static?.square_price_gross || 0 ,4,4)}} 元</td>-->
                        <td>{{roundNum(costItems.process_static?.order_price_overage || 0 ,2,4)}} 元</td>
                        <td>{{roundNum(costItems.process_static?.square_price_gross_overage || 0 ,2,4)}} 元</td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div id="step_others">
                <div class="title collapse" @click="costEvent.collapse('others')">{{dData.stepList.others}}</div>
                <div class="cost-items">
                  <div class="siyi-table header">
                    <table>
                      <tbody>
                      <tr @click="costEvent.collapse('others')" class="collapse">
                        <td>类型</td>
                        <td class="cost-item-title">名称</td>
                        <td>单价</td>
                        <!--                        <td>耗量(PCS)</td>-->
<!--                        <td>订单耗量</td>-->
                        <td>订单耗量(含预投)</td>
                        <!--                        <td>PCS成本</td>-->
                        <!--                        <td>平米成本</td>-->
                        <td>订单成本(含预投)</td>
                        <td>平米成本(含预投)</td>
                      </tr>
                      <tr v-show="!costItems.others.collapse" v-for="item in costItems.others.list">
                        <td>{{item.name}}</td>
                        <td class="cost-item-title">{{item.title}}</td>
                        <td>{{roundNum(item.price,4,4)}}  {{item.rmb}} / {{item.unit}}</td>
                        <!--                        <td>{{roundNum(item.pcs_used,4,4)}} {{item.unit}}</td>-->
<!--                        <td>{{roundNum(item.order_used,4,4)}}   {{item.unit}}</td>-->
                        <td>{{roundNum(item.order_used_overage,4,4)}}   {{item.unit}}</td>
                        <!--                        <td>{{roundNum(item.pcs_price,4,4)}} {{item.rmb}}</td>-->
                        <!--                        <td>{{ item.square_price_gross}} {{item.rmb}}</td>-->
                        <td>{{roundNum(item.order_price_overage,4,4)}}   {{item.rmb}}</td>
                        <td>{{roundNum(item.square_price_gross_overage,4,4)}}   {{item.rmb}}</td>
                      </tr>
                      <tr @click="costEvent.collapse('others')" class="collapse">
                        <td colspan="4">合计</td>
                        <!-- <td>{{roundNum(costItems.others?.pcs_price ,4,4)}} 元</td>-->

                   <!--  <td>{{roundNum(costItems.others?.order_price || 0 ,2,4)}} 元</td>-->
                        <td>{{roundNum(costItems.others?.order_price_overage || 0 ,2,4)}} 元</td>
                        <td>{{roundNum(costItems.others?.square_price_gross_overage || 0 ,2,4)}} 元</td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>



              <div id="step_mix3">
                <div class="title collapse" @click="costEvent.collapse('sales')">{{dData.stepList.mix3}} </div>
                <div class="cost-items">
                  <div class="siyi-table header">
                    <table>
                      <tbody>
                      <tr  @click="costEvent.collapse('sales')" class="collapse">
                        <td>类型</td>
                        <td class="cost-item-title">名称</td>
                        <td>单价</td>
                        <!--                        <td>耗量(PCS)</td>-->
<!--                        <td>订单耗量</td>-->
                        <td>订单耗量(含预投)</td>
                        <!--                        <td>PCS成本</td>-->
                        <!--                        <td>平米成本</td>-->
                        <td>订单成本(含预投)</td>
                        <td>平米成本(含预投)</td>
                      </tr>
                      <tr v-show="!costItems.sales.collapse" v-for="item in [...costItems.sales.list, ...costItems.manger.list,...costItems.finance.list]">
                        <td>{{item.name}}</td>
                        <td class="cost-item-title">{{item.title}}</td>
                        <td>{{roundNum(item.price,4,4)}}  {{item.rmb}} / {{item.unit}}</td>
                        <!--                        <td>{{roundNum(item.pcs_used,4,4)}} {{item.unit}}</td>-->
<!--                        <td>{{roundNum(item.order_used,4,4)}}   {{item.unit}}</td>-->
                        <td>{{roundNum(item.order_used_overage,4,4)}}   {{item.unit}}</td>
                        <!--                        <td>{{roundNum(item.pcs_price,4,4)}} {{item.rmb}}</td>-->
                        <!--                        <td>{{ item.square_price_gross}} {{item.rmb}}</td>-->
                        <td>{{roundNum(item.order_price_overage,4,4)}}   {{item.rmb}}</td>
                        <td>{{roundNum(item.square_price_gross_overage,4,4)}}   {{item.rmb}}</td>
                      </tr>
                      <tr @click="costEvent.collapse('sales')" class="collapse">
                        <td colspan="4">合计</td>
<!--                        <td>{{roundNum((costItems.sales?.pcs_price || 0)+(costItems.manger?.pcs_price || 0)+(costItems.finance?.pcs_price || 0),4,4)}} 元</td>-->

<!--                        <td>{{roundNum((costItems.sales?.square_price_gross || 0)+(costItems.manger?.square_price_gross || 0)+(costItems.finance?.square_price_gross || 0),2,4)}} 元</td>-->
                        <td>{{roundNum((costItems.sales?.order_price_overage || 0)+(costItems.manger?.order_price_overage || 0)+(costItems.finance?.order_price_overage || 0),2,4)}} 元</td>
                        <td>{{roundNum((costItems.sales?.square_price_gross_overage || 0)+(costItems.manger?.square_price_gross_overage || 0)+(costItems.finance?.square_price_gross_overage || 0),2,4)}} 元</td>
                      </tr>

                      </tbody>
                    </table>
                  </div>
                </div>

              </div>


              <div id="step_outwork">
                <div class="title collapse" @click="costEvent.collapse('outwork')">{{dData.stepList.outwork}} </div>
                <div class="cost-items">
                  <div class="siyi-table header">
                    <table>
                      <tbody>
                      <tr @click="costEvent.collapse('outwork')" class="collapse">
                        <td>类型</td>
                        <td class="cost-item-title">名称</td>
                        <td>单价</td>
                        <!--                        <td>耗量(PCS)</td>-->
<!--                        <td>订单耗量</td>-->
                        <td>订单耗量(含预投)</td>
                        <!--                        <td>PCS成本</td>-->
                        <!--                        <td>平米成本</td>-->
                        <td>订单成本(含预投)</td>
                        <td>平米成本(含预投)</td>
                      </tr>
                      <tr v-show="!costItems.outwork.collapse" v-for="item in costItems.outwork.list" >
                        <td>{{item.name}}</td>
                        <td class="cost-item-title">{{item.title}}</td>
                        <td>{{roundNum(item.price,4,4)}}  {{item.rmb}} / {{item.unit}}</td>
                        <!--                        <td>{{roundNum(item.pcs_used,4,4)}} {{item.unit}}</td>-->
<!--                        <td>{{roundNum(item.order_used,4,4)}}   {{item.unit}}</td>-->
                        <td>{{roundNum(item.order_used_overage,4,4)}}   {{item.unit}}</td>
                        <!--                        <td>{{roundNum(item.pcs_price,4,4)}} {{item.rmb}}</td>-->
                        <!--                        <td>{{ item.square_price_gross}} {{item.rmb}}</td>-->
                        <td>{{roundNum(item.order_price_overage,4,4)}}   {{item.rmb}}</td>
                        <td>{{roundNum(item.square_price_gross_overage,4,4)}}   {{item.rmb}}</td>
                      </tr>
                      <tr @click="costEvent.collapse('outwork')" class="collapse">
                        <td colspan="4">合计</td>
                        <!--                        <td>{{roundNum(costItems.outwork?.pcs_price ,4,4)}} 元</td>-->
<!--                        <td>{{roundNum(costItems.outwork?.square_price_gross || 0 ,4,4)}} 元</td>-->
                        <td>{{roundNum(costItems.outwork?.order_price_overage || 0 ,2,4)}} 元</td>
                        <td>{{roundNum(costItems.outwork?.square_price_gross_overage || 0 ,2,4)}} 元</td>
                      </tr>

                      </tbody>
                    </table>
                  </div>
                </div>
              </div>


              <div id="step_order_ext">
                <div class="title " >{{dData.stepList.order_ext}} </div>
                <div class="cost-items">
                  <div class="siyi-table header">
                    <table>
                      <tbody>
                      <tr >
                        <td class="cost-item-title">名称</td>
                        <td>订单成本</td>
                        <td>订单成本(含预投)</td>
                      </tr>
                      <tr  v-for="item in costItems.order_ext.list" >
                        <td class="cost-item-title">{{item.title}}</td>
                        <td>{{roundNum(item.order_price,4,4)}} {{item.rmb}}</td>
                        <td>{{roundNum(item.order_price_overage,4,4)}} {{item.rmb}}</td>
                      </tr>
                      <tr >
                        <td >合计</td>
                        <td>{{roundNum(costItems.order_ext?.order_price || 0 ,4,4)}} 元</td>
                        <td>{{roundNum(costItems.order_ext?.order_price_overage || 0 ,4,4)}} 元</td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>




            </div>
        </template>

      </div>
      <div :class="['footer-box',resultBox.isError?'footer-box-error':'footer-box-ok']" >
        <div class="notice-box">
          <p>成本总金额 {{resultBox.data.order_money_all}} =  (<t-tooltip content="单PCS成本 =  BOM物料按PNL计算按PCS分摊 + 工序固定成本按往期费率固定分摊 + 工序变动成本按产量增减 + 外协工序成本基于缺失工序补足 + 非工序公摊成本由辅助部门产生按面积分摊 + 销管财成本"  placement="top">单PCS成本:{{resultBox.data.pcs_price}}</t-tooltip> * (订单PCS数:{{baseForm.quote.pcs_num}} +  <t-tooltip content="预投数 ： 基于不同产品加工路线及品质管控难度特性、订单面积综合得出 "  placement="top">预投PCS数:{{resultBox.data.pcs_num_all-baseForm.quote.pcs_num}}</t-tooltip>)) * (1+  <t-tooltip content="税负率 ： 增值税（13%） + 附加税（近三年均值3%）"  placement="top">其他税负率:{{resultBox.data.vat_rate + resultBox.data.surtax_rate}}%</t-tooltip>)  + 附加费用:{{resultBox.data.order_money_extra}} </p>
<!--          * (1+<t-tooltip content="利润率 ： 基于不同产品加工难度及耗用资源（如设备、人工、物料）综合得出"  placement="top">利润率:{{resultBox.data.profit_rate}}%</t-tooltip>)-->
        </div>
        <div class="msg-box" v-if="processBox.msgList.length>0">
          <t-alert v-for="msg in processBox.msgList" :theme="msg.type" :message="msg.content" close-btn />
        </div>
        <div class="result-box">
          <div class="result-box-row">


          <dl>
          <dt> 订单数量</dt>
          <dd class="number-editor" :title="(resultBox.data.pcs_of_pnl?(baseForm.quote.pcs_num/resultBox.data.pcs_of_pnl):'')+' PNL'">
            <span  >{{baseForm.quote.pcs_num}}</span>PCS
          </dd>
        </dl>
        <dl>
          <dt>订单毛面积(按SET)</dt>
          <dd class="number-editor" >
            <span >{{roundNum(baseForm.quote.order_area_gross,4,4)}}</span>m²
          </dd>
        </dl>

        <dl :title="(resultBox.data.overage_config?.description || '') + '  (批量预投率：'+(resultBox.data.overage_config?.overage_rate || 0)+' %)'">
          <dt>预投率(含报废)</dt>
          <dd class="number-editor" >
            <span >{{roundNum(resultBox.data.overage_rate,2)}}%</span>
          </dd>
        </dl>

            <dl >
              <dt >单PCS<span style="color: #f56c6c">未税</span>BOM成本(含预投)</dt>
              <dd > - 元</dd>
            </dl>
            <dl :title="'不含预投：'+resultBox.data.pcs_price+' 元'">
              <dt >单PCS<span style="color: #f56c6c">未税</span>成本(含预投)</dt>
              <dd >{{resultBox.data.pcs_price_overage}} 元</dd>
            </dl>

            <dl >
              <dt >平米<span style="color: #f56c6c">未税</span>BOM成本(含预投)</dt>
              <dd > - 元</dd>
            </dl>

            <dl :title="'不含预投：'+resultBox.data.square_price_gross+' 元'">
              <dt >平米价<span style="color: #f56c6c">未税</span>成本(含预投)</dt>
              <dd >{{resultBox.data.square_price_gross_overage}} 元</dd>
            </dl>


          <dl :title="`增值税：${resultBox.data.vat_rate}% + 附加税：${resultBox.data.surtax_rate}%`">
            <dt>税率</dt>
            <dd class="number-editor">
              <span >{{resultBox.data.vat_rate + resultBox.data.surtax_rate}}%</span>
            </dd>
          </dl>

          </div>



          <div class="result-box-row">
          <dl>
            <dt> 投产数量(PCS)</dt>
            <dd class="number-editor">
              <span >{{resultBox.data.pcs_num_all}} PCS</span>
            </dd>
          </dl>

          <dl>
            <dt> 投产数量(PNL)</dt>
            <dd class="number-editor" >
              <span >{{resultBox.data.pnl_num_all}} PNL </span>
            </dd>
          </dl>


        <dl>
          <dt>投产面积(按PNL)</dt>
          <dd class="number-editor">
            <span >{{roundNum(resultBox.data.order_area_all,4,4)}}</span>m²
          </dd>
        </dl>






<!--        <dl>
          <dt>预留净利率</dt>
          <dd class="number-editor">
            <input :value="resultBox.data.profit_rate" name="profit_rate" min="0" max="100"  @change="resultEvent.change"/>%
          </dd>
        </dl>-->
            <dl title="含预投/含税">
              <dt>单PCS<span style="color: #35a1fd">含税</span>BOM成本(含预投)</dt>
              <dd>- 元</dd>
            </dl>

            <dl title="含预投/含税">
              <dt>单PCS<span style="color: #35a1fd">含税</span>成本(含预投)</dt>
              <dd>{{resultBox.data.pcs_price_all}} 元</dd>
            </dl>


            <dl title="含预投/含税">
              <dt>平米价<span style="color: #35a1fd">含税</span>BOM成本(含预投)</dt>
              <dd>- 元</dd>
            </dl>



        <dl title="含预投/含税">
          <dt>平米价<span style="color: #35a1fd">含税</span>成本(含预投)</dt>
          <dd>{{resultBox.data.square_price_gross_all}} 元</dd>
        </dl>

        <dl>
          <dt>应报价金额 (含预投/税/附加费)</dt>
            <dd :title="'含附加费用'+resultBox.data.order_money_extra+'元'">{{resultBox.data.order_money_all}}  元</dd>
        </dl>

          </div>
        </div>
      </div>

    <dialogComponent  v-if="materialBox.isShow" v-bind="materialBox.bind" >
      <TableComponent ref="materialRef" v-if="materialBox.reportIsShow" v-bind="materialReport"/>
    </dialogComponent>


    <dialogComponent  v-if="materialPriceBox.isShow" v-bind="materialPriceBox.bind" >
     <div style="display: flex;justify-content: center;height: 100%; padding-top: 41px;">
       <t-form labelWidth="100px">
         <t-form-item :label="materialPrice.name" :name="materialPrice.name" v-for="materialPrice in materialPriceBox.data">

           <t-input-number v-if="materialPriceBox.inputType==='input'" :step="0.01" :max="10" suffix="倍"
                           style="width: 225px;height: 37px" v-model="materialPrice.value" @change="materialPriceEvent.change" />

           <t-radio-group v-else  v-model="materialPrice.value" @change="materialPriceEvent.change">
             <t-radio-button  v-for="value_option in materialPriceBox.value_options"
                              :key="value_option.value" :value="value_option.value" :label="value_option.label" />
           </t-radio-group>

         </t-form-item>

         <t-form-item>
           <t-radio-group  v-model="materialPriceBox.inputType" style="margin-bottom: 0" >
             <t-radio-button value="radio">快捷选择</t-radio-button>
             <t-radio-button value="input">手动输入</t-radio-button>
           </t-radio-group>
           <t-button  variant="outline" @click="materialPriceEvent.reset"
                      theme="warning" style="margin-left: 20px;margin-bottom: 5px;">重置</t-button>
         </t-form-item>
       </t-form>
     </div>
    </dialogComponent>

  </div>
</template>
<script setup>
import {nextTick, onActivated, onMounted, reactive, ref, toRaw, watch} from 'vue';
import {plantList} from "@/utils/erp.js";
import siyi from "@/core/script/siyi.js";
import * as api from "@/core/script/api.js";
import dialog from "@/core/script/dialog.js";
import DialogComponent from "@/core/component/dialog.vue";
import TableComponent from "@/core/component/table_v2.vue";
import * as _ from 'lodash';
import * as listTableFn from "@/core/script/tableFn.js";
import apiUrl from "@/core/config/url2.js";
import {getOptionsLabel} from "@/utils/vars.js";
import {removeDataLabel} from "@/core/script/tableFn.js";
import {MessagePlugin} from "tdesign-vue-next";


const props = defineProps({
  quote_id:{type:Number,default:0}, // id
  optionMap:{type:Object,default:{}}, // 选择项
  selectOptions:{type:Object,default:{}}, // 选择项
  FORM_TITLE_MAP:{type:Object,default:{}}, // 语言包
  product_code:{type:String,default:''},// 产品编码
});

const quoteRef = ref();
const paramsRef = ref();


/**
 * @type {import('vue').Ref<Array<{ item: {package_name:String,is_show: boolean },process:{},parameters:Array,asset_group_list:[] }>>}
 */
const packages_items = ref([]);

// 静态数据
const dData = {
  FORM_TITLE_MAP:{...props.FORM_TITLE_MAP},
  optionMap:{...props.optionMap},  selectOptions:{...props.selectOptions},
  KL_CODE:['KL','CKL'], // 开料工序CODE;
  plugin_name: {
    auto_calc: 'auto_calc',
    material_code: 'material_code',
    material_num: 'material_num',
    material_price: 'material_price',
    mj_price: 'mj_price',
    order_price: 'order_price',
    zk_normal_holds: 'zk_normal_holds',
    zk_slot_holds: 'zk_slot_holds',
    jgz_normal_holds: 'jgz_normal_holds',
    jgz_slot_holds: 'jgz_slot_holds',
  },
  IS_YES: 'Y',
  IS_NO: 'N',
  IS_NONE: 'NONE',
  // 默认的方形复选框样式
  check_group_bind: {
    multiple: true,
    checkedProps: {
      theme: 'primary', variant: 'outline', size: 'large',
    },
    uncheckedProps: {
      theme: 'default', variant: 'outline', size: 'large',
    }
  },
  // 包类型
  package_type: {
    'TYPE_BASE': 0,
    'TYPE_SERVICE': 1,
    'TYPE_EXTEND': 2
  },
  // 输入框类型
  input_type: {
    TEXT: 'string',
    NUMBER: 'number',
    RADIO: 'radio',
    SELECT: 'select',
    SWITCH: 'switch',
    TIME: 'time',
    DATE: 'date',
    IMG: 'img',
    FILE: 'file',
  },
  // 值类型
  value_type: {
    INT: 'int',
    FLOAT: 'float',
    TEXT: 'text',
    ARRAY: 'array',
    OBJECT: 'object',
    FILE: 'file',
    DATE: 'date',
  },
  stepList: {
    bom: 'BOM物料',
    process_dynamic: '工序-变动',
    process_static: '工序-固定',
    others: '非工序',
    mix3: '销管财',
    outwork: '外协加工',
    order_ext: '附加费用',
  },
  // quote_base选填字段
  quoteBaseOptionalFields:['cust_product_code','product_code'],
  // quote_params选填字段
  quoteParamsOptionalFields:[],
  // quote_base数字字段
  quoteBaseNumberFields:['pcs_length','pcs_width','pcs_num'],
  // quote_params数字字段
  quoteParamsNumberFields:['layerNum','thickness','copperThickness','innerCopperThickness','minTraceWidth','minTraceSpacing','minDrillSize'],
  costTableColumns: {
    item_type: '分类', name: '类型', title: '名称',desc:'描述', unit: '单位', price: '单价', rmb: '货币',
    pcs_used: 'PCS耗量', order_used: '订单耗量',order_used_overage:'订单耗量(含预投)',
    pcs_price: 'PCS成本#A',order_price: '订单成本#H',order_price_overage:'订单成本(含预投)#A',
    square_price: '平米成本#H', square_price_gross:'平米成本(毛面积)#A',square_price_gross_overage:'平米成本(含预投)#A',
  },//表格成本项列名
  costItemDefault:{
    type: null,item_type: null,name: null,cate: null,  title: null,desc:null, unit: null,  rmb: '元',item_data:{},price: null,priceRate: 1,
    pcs_used: null, pcs_price: null,
    order_used: null, order_price: null,
    order_used_overage:null,order_price_overage:null,
    square_price: null, square_price_gross:null,square_price_gross_overage:null,
  },// 成本项默认值
  overage_list:[],// 预投率列表
  overage:{
    TYPE_AREA:0, // 预投率类型：按面积
    TYPE_PNL:1, // 预投率类型：按PNL
  },
  cost_type: {
    TYPE_BOM: 'bom',
    TYPE_PROCESS: 'process',
    TYPE_AREA: 'area',
    TYPE_ORDER: 'order',
  }, // 成本项类型（大类）
};

// 默认数据
const defaultData={
  quote_base:{
    plant_id_order: siyi.user.plantId,
    plant_id_make: siyi.user.plantId,
    sale_type: 'cn',
    customer_name: '',
    cust_product_name: '',
    cust_product_code: '',
    product_code: siyi.isDev?'BH1286P04E0136470A0':'',//
    product_id: 0, // 型号ID(隐藏属性)
    pcs_length: null, // pcs长
    pcs_width: null, // pcs宽
    pcs_num: null, // pcs数量
    pcs_area:0, // PCS净面积
    pcs_area_gross: 0,//PCS毛面积
    pcs_area_lyl: 1,//PCS净面积率
    order_area: 0, // 净面积(按PCS)
    order_area_gross: 0, // 毛面积（按SET）
  },
  quote_params:{
    package_id_base: null,
    package_id_service: null,
    layerNum: null, // 层数
    thickness: null, // 成品板厚
    copperThickness: null,//成品铜厚
    innerCopperThickness: null,//内层成品铜厚
    coreThickness: null, //芯板厚度
    minTraceWidth: null, //最小线宽
    minTraceSpacing: null, //最小线距
    minDrillSize: null, // 最小孔径
    mechBlindBuriedViaLayers: null,// 机械盲埋孔贯穿层数
    finishType: null, //表面处理方式
    testingItems: [],// 测试方式
    checkTools:[], // 检测工具
    // useAVI: dData.IS_NO, //是否使用AVI
    // isOpticalModule:dData.IS_NO, // 是否光模块
    isResinPlugging: dData.IS_NO, // 是否树脂塞孔
    isBuriedCopper: dData.IS_NO, //是否线圈或压接孔板
    isXQYJ: dData.IS_NO, //是否是否埋铜块
    goldFingerType: dData.IS_NONE, //金手指类型
    XBType: siyi.isDev?dData.IS_NONE:null, //斜边类型
    profileType: 'routing', // 外形加工方式
    drillType: dData.IS_NONE, // 多钻特性
    vDrillMultipleType: [dData.IS_NONE], //特殊钻锣V
    vDrillMultipleType2: [dData.IS_NONE], //特殊钻锣V
    fontMultipleType: [dData.IS_NONE], //文字工艺
    features:[dData.IS_NONE], // 其他特性
    holdsSumOfPcs:{},// 机械孔数(隐藏属性),按工艺区分
    jgzHoldsSumOfPcs:{},//激光钻孔数(隐藏属性)
  },
};


// 公共动态数据
const vData = reactive({
  package_base:{}, //当前选中的基础包
  package_service:{data:{pnl_min:2}}, // 当前选中的服务包
  // select下拉选择项
  select_options:{
    sale_type: [],
    packages_base: [],
    packages_service: [],
    package_id:[],
    product_code:[],

    // productionType:[],
    // useAVI:[],
    // isOpticalModule:[],
    isBuriedCopper:[],
    isResinPlugging:[],
    profileType:[],
    goldFingerType:[],
    testingItems:[],
    finishType:[],
    XBType:[],
    // finishTypeGold:[],
    drillType:[],
    vDrillMultipleType:[],
    vDrillMultipleType2:[],
    fontMultipleType:[],
    features:[],
    material_show_all: [{label: '按条件显示', value: 0,}, {label: '显示全部', value: 1,},],
    item_type:[],
    business_region:[],
  },
});

const jobSelectorRef=ref();

// 基础表格
const baseForm = reactive({
  isInit:false,
  // 表格配置
  bind: {
    layerNum: {min: 1, max: 30, step: 2},
  },
  quoteRules: {
    pcs_num: [
      {validator: (val) => val > 0, message: 'PCS数量必须大于0', trigger: 'change',},
      {pattern: /^[1-9]\d*$/, message: 'PCS数量必须是正整数', trigger: 'change',} // 只能是正整数
    ],
    pcs_width: [
      {
        validator: () => {
          const {pcs_length, pcs_width} = baseForm.quote;
          if (Number(pcs_length) <= 0 || Number(pcs_width) <= 0) {
            return {result: false, message: 'PCS尺寸必须大于0', type: 'error'};
          }
          if (Number(pcs_length) < Number(pcs_width)) {
            return {result: false, message: 'PCS长不能小于宽', type: 'error'};
          }
          return true;
        }, trigger: 'change',
      }
    ]
  },
  paramsRules: {
    layerNum: [
      {
        message: '层数仅支持输入：1或2-30之间的偶数', trigger: 'change',
        validator: (val) => val === 1 || (val >= 2 && val <= 30 && val % 2 === 0),
      }
    ],
    thickness: [
      {
        message: '成品板厚不能小于芯板厚度', trigger: 'change',
        validator: (val) => val >= baseForm.params.coreThickness,
      }
    ],
    coreThickness: [
      {
        message: '芯板厚度不能大于成品板厚', trigger: 'change',
        validator: (val) => val <= baseForm.params.thickness,
      }
    ],
    /*copperThickness: [
      {message: '成品铜厚不能大于成品板厚', trigger: 'change',
        validator: (val) => val <= baseForm.params.thickness,
      }
    ],*/
  },
  id:null, // 报价ID
  quote: {...defaultData.quote_base},// 报价单基础数据
  params: {...defaultData.quote_params},// 报价单参数
})

const baseFormEvent={
  init: async () => {
    baseForm.isInit=true;
    console.log('form-init',baseForm);
    if (baseForm.quote.product_code && !baseForm.id){
      await baseFormEvent.jobSearch(baseForm.quote.product_code);
    }
    baseFormEvent.execOrderArea();
  },
  //表单数据改变事件
  change:async (value, context, _field) => {
    const field = _field || context?.name;
    // console.log(field + " change:", value, context, _field);
    if (!field) {
      dialog.error('请配置字段');
      return;
    }
    // 选中NONE值，清除其它，反之清除NONE
    if (Array.isArray(value) && baseForm.params.hasOwnProperty(field)) {
      const valueList = Array.isArray(baseForm.params[field]) ? baseForm.params[field] : []; // 当前参数值
      const valueChecked = context?.value; // 当前操作的选项值
      if (valueChecked){
        const valueOption = context?.option || vData.select_options[field].find(v => v.value === valueChecked);
        baseForm.params[field] = valueOption?.value === dData.IS_NONE ? [dData.IS_NONE] : valueList.filter(item => item !== dData.IS_NONE);
      }
    }
    // 制造工厂改表
    if (field === 'plant_id_make') {
      plantChange(value);
    }
    // 基础包改变
    if (field === 'package_id_base') {
      const option = vData.select_options.packages_base.find(item => item.value === value);
      baseForm.params.package_id_service = null;
      vData.package_base = {...option};
      return;
    }

    // 服务包改变
    if (field === 'package_id_service') {
      const option = vData.select_options.packages_service.find(item => item.value === value);
      vData.package_service = {...option};
      resultBox.data.profit_rate=option.data?.profit_rate || 0; // 预留净利率

      // 层数处理
      const config = option.data?.config || {};
      const min = config?.layer_min;
      const max = config?.layer_max;

      if (typeof min === 'number' && typeof max === 'number') {
        baseForm.bind.layerNum.min = min; // 设置范围
        baseForm.bind.layerNum.max = max; // 设置范围
        const layerNum = baseForm.params.layerNum;  // 当前层数
        const isFixed = min === max; // 固定值
        baseForm.bind.layerNum.readonly = isFixed;  // 设置 readonly
        if (isFixed && !baseForm.quote.product_id) {
          baseForm.params.layerNum = min;  // 固定值
        } else {
          // 非固定才校验
          if (layerNum == null || layerNum < min || layerNum > max) {
            dialog.warning(`层数超出范围 ${min} ~ ${max}，请修改!`);
          }
        }
      }
    }

    // 层数变动
    if (field === 'layerNum' && value <= 2) {
      baseForm.params.coreThickness = baseForm.params.thickness;
    }


    if (field === 'sale_type') {
      resultBox.data.vat_rate = value === 'cn' ? 13 : 0; // 内销增值税13%，外销0%
    }
    if (['pcs_num','pcs_length','pcs_width'].includes(field)) {
      baseFormEvent.execOrderArea();
      if (packages_items.value.length>0){
        costEvent.updateAllCost();
      }
    }

    if (field === 'product_code' && context?.option){
      baseForm.quote.product_id= 0;
      await baseFormEvent.jobSelected(context.option);
    }

    if (['layerNum','package_id_service'].includes(field)){
      await baseFormEvent.getOverage();
    }

  },
  jobSearch: async (value) => {
    console.log('jobSearch',value);
    if(typeof value!=='string' || value.length<5) return;
    const res = await api.get(api.url2.cost.quote.jobList, {keyword: value,plant_id:baseForm.quote.plant_id_make});
    if (!Array.isArray(res)) return ;
    vData.select_options.product_code=[...res];
    if (vData.select_options.product_code.length===1 && !baseForm.id){
      await baseFormEvent.jobSelected(vData.select_options.product_code[0]);
    }
  },
  jobSelected:async (job)=>{
    console.log('jobSelected',job);
    if(job?.history?.id){
      dialog.warning(`此型号 ${job['history']['created_uid_text']} 在 ${job['history']['created_time_text']} 已报价！`,10000);
    }
    const baseFormRawData = {quote:baseForm.quote,params:baseForm.params};
    baseForm.quote.product_id = job.recId;
    const {quote,params} = await api.get(api.url2.cost.quote.jobQuoteParams,{id:job.recId});
    baseForm.quote={...baseForm.quote,...quote}
    Object.keys(quote).forEach(key=>{
      if (baseFormRawData.quote[key]!==quote[key]){
        console.log('quote_base_change',key,baseFormRawData.quote[key],quote[key]);
        baseFormEvent.change(quote[key],undefined,key);
      }
    })
    baseForm.params={...baseForm.params,...params};
    Object.keys(params).forEach(key=>{
      if (baseFormRawData.params[key]!==params[key]){
        console.log('quote_params_change',key,baseFormRawData.params[key],params[key]);
        baseFormEvent.change(params[key],undefined,key);
      }
    })
    baseForm.bind.layerNum.readonly=true;
  },
  getMi:async ()=>{
    if (!baseForm.quote.product_id) return ;
    const loading = dialog.loading(undefined, '获取MI中...');
    await api.getErpPdf('mi',{id:baseForm.quote.product_id},'url');
    loading.close();
  },
  //计算面积
  execOrderArea:()=>{
    // 毛面积 =  (SET面积 / PCS_SET) * PCS数量
    const KLValues = processEvent.getKlValue();
    baseForm.quote.pcs_area = baseForm.quote.pcs_length*baseForm.quote.pcs_width/1000000; // PCS净面积
    baseForm.quote.order_area=baseForm.quote.pcs_area*baseForm.quote.pcs_num; // 订单净面积
    baseForm.quote.pcs_area_gross = KLValues?(((KLValues['COST_SET_L']*KLValues['COST_SET_W'])/KLValues['COST_PCS_OF_SET'])/1000000):0; // PCS毛面积
    baseForm.quote.order_area_gross=baseForm.quote.pcs_area_gross*baseForm.quote.pcs_num; // 订单毛面积
    baseForm.quote.pcs_area_lyl = baseForm.quote.pcs_area_gross>0?baseForm.quote.pcs_area/baseForm.quote.pcs_area_gross:1;
  },
  // 提交
  submit: async ({validateResult, firstError}) => {
    resultBox.isError=true;
    // 报价单验证
    const validateResultQuote = await quoteRef.value.validate();
    if (typeof validateResultQuote === 'object') {
      const firstField = Object.keys(validateResultQuote)[0];
      const firstErrorData = validateResultQuote?.[firstField]?.[0] || null;
      if (firstErrorData) {
        document.getElementsByClassName(`t-form-item__${firstField}`)[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        dialog.warning(firstErrorData.message);
        return;
      }
    }
    if (validateResult !== true) {
      const firstField = Object.keys(validateResult)[0];
      document.getElementsByClassName(`t-form-item__${firstField}`)[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      dialog.warning(firstError);
      return
    }
    await baseFormEvent.getProcess();
    materialPriceEvent.init();
    const confirmed = materialPriceBox.isChanged ? await dialog.confirmAsync('物料价格已手动调整，是否重置为原价？','请确认',{okval:'重置',noval:'保留'}) : true
    confirmed && materialPriceEvent.reset();
  },
  // 获取工序
  getProcess:async ()=>{
    const loading = dialog.loading(undefined, '加载中...');
    processBox.msgList=[];
    const res = await api.post(api.url2.cost.quote.create,{quote:baseForm.quote,params:baseForm.params,});
    loading.close();
    if (!res) return ;
    processBox.msgList = [...res.msg];
    processBox.msgList.forEach(msg=>MessagePlugin?.[msg.type](msg.content,msg?.duration || 10000)); // @todo dialog 兼容性bug,暂时用MessagePlugin
    packages_items.value = [...res.items];
    processBox.costData=[...res.costs];
    costEvent.updateAllCost();
    costTable.isShow=false;
    document.title = "报价单_"+siyi.user.nickname+'_'+baseForm.quote.product_code;
    baseForm.quote.product_id && await processEvent.autoLoad();
  },
  // 获取预投率
  getOverage:async ()=>{
    const query ={
      package_id:baseForm.params.package_id_service,
      layer:baseForm.params.layerNum,
    };
    if (!query.package_id || !query.layer) {
      dData.overage_list =  [];
      return ;
    }
    const loading = dialog.loading(undefined, '加载中...');
    const res =await api.get(api.url2.cost.overage.list,query);
    loading.close();
    dData.overage_list = res?.list || [];
  }

};




const processBox = reactive({
  msgList:[], // 消息列表
  costData: [], // 来自工序的成本数据
  navCollapse: true,  // 导航栏是否展开
  detailMode: true, // 完整模式
  navList:[
    {key: 'top', icon: 'ri-skip-up-line', title: '滚动至顶部', show: () => processBox.navCollapse},
    // {key: 'hide', icon: 'ri-close-line', title: '折叠按钮', show: () => processBox.navCollapse},
    // {key: 'show', icon: 'ri-apps-line', title: '展开按钮', show: () => !processBox.navCollapse},
    {key: 'openMI', icon: 'ri-file-pdf-2-fill', title: '打开MI', style:"color:orange",show: () => baseForm.quote.product_id},
    {key: 'focusMode', icon: 'ri-zoom-out-line', title: '打开简洁模式',style:"color:orange", show: () => processBox.navCollapse && processBox.detailMode},
    {key: 'detailMode', icon: 'ri-zoom-in-line', title: '关闭简洁模式', show: () => processBox.navCollapse && !processBox.detailMode},
    {key: 'bottom', icon: 'ri-skip-down-line', title: '滚动至底部', show: () => processBox.navCollapse},

  ],
})

const processEvent={
  // 自动获取物料列表
  autoLoad: async () => {
    const loading = dialog.loading(undefined, '读取数据中...');
    for (const packages_item of packages_items.value) {
      for (const parameter of packages_item.parameters) {
        if (parameter.plugin_name === dData.plugin_name.material_code && parameter?.material_list) {
          for (const [material_index, material_row] of parameter.material_list.entries()) {
            await processEvent.getMaterialList(parameter, packages_item, material_index, false);
            await processEvent.getMaterialNum(parameter, packages_item, material_index);
          }
        } else if (parameter.plugin_name) {
          await processEvent.getParameter(parameter, packages_item, {}, true);
        }
      }
    }
    loading.close();
    resultEvent.check();
  },
  getKlValue:()=>{
   return  packages_items.value.length>0?Object.fromEntries(packages_items.value.find(item=>dData.KL_CODE.includes(item?.process?.code))?.parameters?.map(p => [p.code, p.value])):null;
  },
  getMaterialList:async (parameter,packages_item,material_index,showDialog=true)=>{
    const code_parameter= parameter.material_list[material_index].code;
    const parameters = Object.fromEntries(packages_item.parameters.map(item => [item.code, item.value])); // 当前步骤参数
    const kl_parameters=processEvent.getKlValue();
    const query ={
      id: code_parameter.id,
      value: code_parameter?.value,
      plant_id:baseForm.quote.plant_id_make,
      plugin_params:code_parameter.plugin_params,
      parameters,
      kl_parameters
    };
    const loading = showDialog?dialog.loading(undefined, '读取数据中...'):null;
    const apiRes = await api.post(api.url2.cost.quote.materialList, query);
    loading && loading.close();
    if(showDialog && apiRes?.msg){
      apiRes.msg.forEach(msg=>MessagePlugin?.[msg.type](msg)); // @todo dialog 兼容性bug,暂时用MessagePlugin
    }
    const materialList = removeDataLabel(apiRes?.list || [],apiRes?.columnSplit || '#'); // 还原原始不带标识的数据
    if (typeof materialList === 'object' && materialList.length === 1  && materialList[0]?.value && !query.value) {
      await processEvent.choseMaterial(parameter, code_parameter, materialList)  // 为空，只有一个，直接选择
    } else if (showDialog) {
      await materialEvent.show(query, (rows) => processEvent.choseMaterial(parameter, code_parameter, rows), code_parameter.name); // 不止一个，弹窗，提示用户选择
    }
  },
  // 选择物料
  choseMaterial: async (parameter, code_parameter, rows) => {
    const row = rows?.[0] || null;
    if (!row?.value) {
      dialog.warning('物料：'+row.label+' 不可选!');
      return;
    }
    code_parameter.value = row.value;
    code_parameter.price = row.price;
    code_parameter.select_options = [{label: row.label, value: row.value}];
    code_parameter.material = {...row};
    processEvent.change(parameter);
    return true;
  },
  // 计算bom用量
  getMaterialNum:async (parameter,packages_item,material_index,isReplace=true)=>{
    const num_parameter=parameter.material_list[material_index].num;
    const res = await processEvent.getParameter(num_parameter, packages_item,{material:parameter.material_list[material_index]},isReplace);
    res && (num_parameter.value *= parameter.material_list[material_index].num.ratio)
    processEvent.change(parameter);
  },
  // 后台计算参数
  getParameter:async (parameter,packages_item,post_data,isReplace=false)=>{
    if (parameter.value && !isReplace && !parameter.is_readonly){
      processEvent.change(parameter)
      return  // 有数据，不处理
    }
    const parameters = Object.fromEntries(packages_item.parameters.map(item => [item.code, item.value]));
    const items = packages_items.value.map(item => {
      const _parameters = Object.fromEntries(item.parameters.map(item => [item.code, item.value]));
      return {id: item.id, package_name: item.package_name, process_code: item.process.code, process_name: item.process.name, parameters:_parameters};
    });
    const post = {
      id: parameter.id,
      parameter,
      parameters,
      quote_base:baseForm.quote,
      quote_params: baseForm.params,
      items,...(post_data || {})
    };
    const res = await api.post(api.url2.cost.quote.calcParameter,post);
    if (!res) return;
    parameter.value= res.value;
    parameter.input_options= res.input_options;
    processEvent.change(parameter)
    return parameter.value;
  },

  // 添加物料组件
  addMaterial: async (parameter, material_index) => {
    const material_max= parameter?.plugin_params?.material_max || 10;
    if (material_max && parameter.material_list.length>=material_max){
      dialog.warning('超过最大数量限制：'+material_max);
      return ;
    }
    const defaultData = { code: { value: '' }, num: { value: 0 } };
    const currentItem = parameter.material_list[material_index];
    const newItem = {
      ...currentItem,
      code: { ...currentItem.code, ...defaultData.code },
      num: { ...currentItem.num, ...defaultData.num }
    };
    // 插入到指定 index 后面
    parameter.material_list.splice(material_index + 1, 0, newItem);
  },
  // 移除物料组件
  removeMaterial: async (parameter, material_index) => {
    if (parameter.material_list.length <= 1) {
      dialog.warning('至少保留一行');
      return;
    }
    const res = await dialog.confirmAsync('确定要移除 【' + parameter.name + '】第'+(material_index+1)+'行吗？');
    if (!res) return;
    parameter.material_list.splice(material_index, 1);
    costEvent.updateAllCost();
  },
  //表单数据改变事件
  change:(parameter)=>{
    if (parameter?.plugin_name || dData.KL_CODE.includes(parameter?.process?.code)){
      costEvent.updateAllCost();
    }
  },
  //创建选项
  createOptions:(value,parameter)=>{
    const options = parameter?.select_options || [];
    const option = options.find(item => item.value === value);
    if (!option){
      parameter.select_options.push({value,label:value})
    }
    parameter.value = value;
  },
  navClick: (name) => {
    const handlers = {
      top: () => {
        const el = document.querySelector('.process-list');
        el?.scrollTo({top: 0, behavior: 'smooth'});
      },
      bottom: () => {
        const el = document.querySelector('.process-list');
        el?.scrollTo({top: el.scrollHeight - el.clientHeight, behavior: 'smooth'});
      },
      show: () => processBox.navCollapse = true,
      hide: () => processBox.navCollapse = false,
      detailMode: () => processBox.detailMode = true,
      focusMode: () => processBox.detailMode = false,
      openMI: () => baseFormEvent.getMi(),
    };
    handlers[name]?.();
  }
};


// 物料选择



const materialRef= ref();
const materialEvent={
  show: async (query,onChoose,title) => {
    materialBox.query={...query};
    materialBox.isShow = true;
    materialReport.tableConfig.id='material_list_'+query.id;
    materialReport.tableConfig.name=title;
    materialBox.reportIsShow = true;
    materialBox.onChoose=onChoose;
  },
  close: () => {
    materialBox.isError = false;
    materialBox.reportIsShow = false;
    materialBox.isShow=false;
    materialBox.query={};
  },
  choose: async (rows) => {
    const res = await materialBox.onChoose(toRaw(rows));
    res &&  materialEvent.close();
  },
}

const materialBox = reactive({
  query:{},
  isShow: false,
  bind: {width:'70%',height:'70%',title:'物料选择',onAfterClose:materialEvent.close},
  onChoose: ()=>{},
  reportIsShow: false,
  reportIsInit: false,
  isError:false,
});



const materialReport={
  menuConfig: {
    defaultMenuShowList:['query','search','moreSettings','pageExport','clearCache'],
    menu: {
      chose: {sort: 500, title: '选中', icon: 'ri-check-fill', listAction: materialEvent.choose},
    },
  },
  searchConfig: {
    search: [
      {
        type: 'radio', title: '显示所有', field: 'material_show_all',value:0,
        options: {placeholder: '显示所有', options: vData.select_options.material_show_all}
      },
    ]
  },
  detailConfig:{colNum:3},
  tableConfig: {
    get:async (url,query)=>{
      const res = await api.post(url,{...query,...materialBox.query});
      if (!res) {
        materialBox.isError=true;
      }
      return res;
    },
    url:api.url2.cost.quote.materialList,
    columnSplit:'#',
    showCheck: 'radio',
    // checkField: 'check',
    disablePage: true,
    useUserTableConfig: false,
    useEncryptionFields: false,
    afterLoaded: ()=>{
      materialBox.isError && materialEvent.close();
      const records = materialRef.value.reportConfig.table.records.filter(v=>v.value);
      if (records.length===1 && !materialBox.query?.value){
        materialEvent.choose(records); // 仅有一个，默认选中
      }
    },
  }
};

const materialPriceEvent={
  init:()=>{
    const last_data=[...materialPriceBox.data];
    const new_data = [];
    const bom_list = costItems.value.bom.list || [];
    const cate_name_list =  [...new Set(bom_list.map(item => item.name).filter(v=>v))];
    for (const cate_name of cate_name_list) {
      const isIgnore = materialPriceBox.ignore_name_keyword.some(v => cate_name.includes(v));
      if (isIgnore) continue;
      const last_item = last_data.find(item => item.name === cate_name);
      new_data.push({type: 'cate',name: cate_name, value: last_item?.value ?? 1});
    }
    materialPriceBox.data = [...new_data];
    materialPriceBox.isChanged = materialPriceBox.data.filter(item => item.value !== 1).length > 0;
  },
  show:()=>{
    materialPriceEvent.init();
    materialPriceBox.isShow=true;
  },
  change:()=>{
    materialPriceBox.isChanged = materialPriceBox.data.filter(item => item.value !== 1).length > 0;
    costEvent.updateAllCost();
  },
  reset:()=>{
    materialPriceBox.data = [...materialPriceBox.data.map(item => ({...item, value: 1}))];
    materialPriceEvent.change();
  },
  close:()=>{
    materialPriceBox.isShow=false;
  }
}
const materialPriceBox = reactive({
  ignore_name_keyword:['墨','膜','钻','锣'],
  value_options: [{label: '原价', value:1}, {label: '+ 5%', value: 1.05}, {label: '+ 10%', value: 1.1}, {label: '+ 15%', value: 1.15}],
  data:[],
  isShow: false,
  isChanged: false,
  inputType: 'radio',
  bind: {width:'600px',height:'600px',title:'物料调价',onAfterClose:materialPriceEvent.close},
  onChoose: ()=>{},
});


// 成本项列表
const costList = reactive({
  step: 'step1',
  isInit: false,
  scrollTo: id => {
    nextTick(() => {
      const el = document.getElementById('step_'+id);
      if (el) {
        el.scrollIntoView({behavior: 'smooth'});
        costList.step = id;
      }
    });
  }
})

const costItems = ref();

const costEvent={
  updateAllCost: () => {
    costEvent.init();
    costEvent.updateOverageRate();
    costEvent.updatePCSNum();
    costEvent.updateZKPrice();
    costEvent.updateProcessPrice();
    costEvent.updateAssetGroup();
    costEvent.updateBomList();
    costEvent.updateMJPrice();
    costEvent.updateOrderPrice();
    costEvent.updateResult();
  },
  // 初始化
  init:()=>{
    const items = Object.fromEntries(
        [...vData.select_options.item_type.map(i => i.value), 'order_ext'].map(v => [
          v,
          { list: [], collapse: false, pcs_price: 0, order_price: 0,order_price_overage:0,
            square_price: 0, square_price_gross:0,square_price_gross_overage:0} // 合计价格
        ])
    );
    costItems.value={...items};
    costList.isInit=true;
    const kl_parameters = Object.fromEntries(
        (packages_items.value.find(item =>
            dData.KL_CODE.includes(item?.process?.code)
        )?.parameters ?? []).map(({ code, value }) => [code, value])
    );
    // const pnlOfSheet = Number(kl_parameters?.['COST_PNL_OF_SHEET'] || 0);
    const setOfPnl = Number(kl_parameters?.['COST_SET_OF_PNL'] || 0);
    const pcsOfSet = Number(kl_parameters?.['COST_PCS_OF_SET'] || 0);
    resultBox.data.pcs_of_pnl = setOfPnl * pcsOfSet;//一个PNL 多少个PCS
    baseFormEvent.execOrderArea();
  },
  // 更新预投率
  updateOverageRate: () => {
    const overage_list = dData.overage_list.filter(item =>
        baseForm.quote.order_area_gross> item.area_min
        && baseForm.quote.order_area_gross<= item.area_max
    ); // 先根据面积锁定预投率
    const overage_rate_list = [...new Set(overage_list.map(v=>v.overage_rate))].filter(v=>v);
    if (baseForm.quote.order_area_gross && (!overage_rate_list || overage_rate_list.length!==1)){
      dialog.warning('预投率获取失败，请检查预投率配置！'+JSON.stringify(overage_list));
    }
    resultBox.data.overage_list= [...overage_list];

  },
  // 更新PCS数量
  updatePCSNum: () => {
    const pcsOfPnl = resultBox.data.pcs_of_pnl || 0;
    const pcs_num = baseForm.quote.pcs_num; // 订单PCS数量
    const pcs_area = baseForm.quote.order_area_gross  / pcs_num ; // 订单PCS面积
    const pnl_num = pcs_num/pcsOfPnl; // 订单PNL数量

    const KLValues= processEvent.getKlValue();
    const pnl_area = KLValues? KLValues['COST_PNL_W']*KLValues['COST_PNL_L'] / 1000000 : 0;

    let pnl_min = 2;
    const overage_list = resultBox.data.overage_list.filter(item =>
         pnl_num >= item.pnl_min
        && (pnl_num < item.pnl_max || !item.pnl_max)
    );
    const overage_rate = overage_list?.[0]?.overage_rate || 0; // 预设预投率
    if (overage_list.length===1){
      const  {type,overage_pnl,pnl_add}=overage_list?.[0] || {};
      if (type===dData.overage.TYPE_PNL && overage_pnl){
        pnl_min = overage_pnl  // 按固定PNL
      }else{
        pnl_min = Math.ceil(pcs_num * (1+overage_rate/100)/pcsOfPnl)// 按PCS预投，再取整
      }
      pnl_min += (pnl_add || 0); // 额外PNL数量
      resultBox.data.overage_config={...overage_list[0]};
    }else{
      resultBox.data.overage_config={};
    }
    resultBox.data.overage_id = resultBox.data.overage_config?.id;

    pnl_min || dialog.warning('请检查预投率配置！'+JSON.stringify(overage_list));

    const pnlAll = Math.max(pnl_min, Math.ceil(pcs_num/pcsOfPnl)); //PNL实际数量
    const pcsAll = pcsOfPnl * pnlAll; // 实际PCS总数

    resultBox.data.pcs_num_all = pcsAll;
    resultBox.data.pnl_num_all = pnlAll;
    resultBox.data.order_area_all = roundNum(pnl_area * pnlAll,2,2);

    resultBox.data.overage_rate= roundNum((pcsAll / baseForm.quote.pcs_num - 1) * 100) //预投率


    // console.log('baseForm.quote',resultBox.data.overage_rate,baseForm.quote)
  },

  // 更新孔数
  updateZKPrice: () => {
    const zk_holds_sum = {};  // 机械孔数
    const jgz_holds_sum = {}; // 激光钻孔数
    const pcsOfPnl = resultBox.data.pcs_of_pnl || 0;
    if (pcsOfPnl>0){
      packages_items.value.forEach(({ process:{id}, parameters }) => {
        for (const { plugin_name, value } of parameters) {
          const v = Number(value) / pcsOfPnl;
          if (plugin_name === dData.plugin_name.zk_normal_holds) {
            zk_holds_sum[id] = (zk_holds_sum[id] || 0) + v;
          } else if (plugin_name === dData.plugin_name.zk_slot_holds) {
            zk_holds_sum[id] = (zk_holds_sum[id] || 0) + v * 1.5;
          } else if (plugin_name === dData.plugin_name.jgz_normal_holds) {
            jgz_holds_sum[id] = (jgz_holds_sum[id] || 0) + v;
          } else if (plugin_name === dData.plugin_name.jgz_slot_holds) {
            jgz_holds_sum[id] = (jgz_holds_sum[id] || 0) + v * 1.5;
          }
        }
      });
    }
    baseForm.params.holdsSumOfPcs = { ...zk_holds_sum };
    baseForm.params.jgzHoldsSumOfPcs = { ...jgz_holds_sum };
  },
  // 更新来自工序的成本
  updateProcessPrice: () => {
    processBox.costData.forEach(item => {
      const priceData={
        ...dData.costItemDefault,
        name:item.item_name,
        type:dData.cost_type.TYPE_PROCESS,
        item_type:item.item_type,
        title:item.title,
        unit:item.unit_name,
        price:item.avg_price,
        item_data:{...item},
      };

      if (['平米','平方米'].includes(item.unit_name)){
        // 单价是整个订单的毛面积平米价，用量就是订单毛面积
        priceData.pcs_used = baseForm.quote.pcs_area_gross;// PCS用量，就是pcs毛面积
        priceData.order_used = baseForm.quote.order_area_gross; // 订单耗量，就是订单毛面积
      }else if(item.unit_name==='千孔'){
        const isJgz = item.process_name?.includes('激光'); // 是否是激光钻
        const holdsNum= (isJgz ? baseForm.params.jgzHoldsSumOfPcs : baseForm.params.holdsSumOfPcs)?.[item.process_id] || 0
        priceData.pcs_used = roundNum(holdsNum / 1000); // PCS耗量
        priceData.order_used = roundNum(baseForm.quote.pcs_num * priceData.pcs_used); // 订单耗量
      }else{
        dialog.error('暂不支持该单位：'+item.unit_name);
      }
      // 销管财，面积不含预投
      const pcs_num= ['sales','manger','finance'].includes(item.item_type) ?baseForm.quote.pcs_num :resultBox.data.pcs_num_all;
      // priceData.order_used_overage=roundNum(priceData.pcs_used *  pcs_num); // 订单耗量(预投) = PCS用量 * 订单PCS数量(不含预投)

      if (priceData.price>0 && priceData.order_used>0){
        costEvent.pushCostItem(priceData);
      }
    });
  },
  // 更新成本项中的设备组
  updateAssetGroup: () => {
    const cost_data={...costItems.value};
    const allAssetGroups = [...new Set(packages_items.value.map(v => Object.values(v.item.asset_group_id)).flat())] ;
    for (const key in cost_data) {
      cost_data[key].list = cost_data[key].list.filter(item => {
        return !(item.avg_level === 3 && !allAssetGroups.includes(item.asset_group_id))
      })
    }
    costItems.value={...cost_data};
  },
  // 更新物料列表
  updateBomList: ()=>{
    const RmbMap={'RMB':'元', 'USD':'美元'};
    packages_items.value.forEach((item) => {
      const material_parameters= item.parameters.filter(v=>v.plugin_name===dData.plugin_name.material_code) || [];
      for (const parameter of material_parameters) {
        for (const parameter_material of parameter.material_list) {
          const material_name= parameter_material.code.material?.['物料分组'] || '';
          const priceRate = materialPriceBox.data.find(v=>v.name===material_name && v.type==='cate')?.value || 1; // 价格倍率
          const priceData={
            ...dData.costItemDefault,
            type: dData.cost_type.TYPE_BOM,
            item_type:'bom',
            name:material_name,
            title :parameter_material.code.material?.label || '',
            desc: (parameter_material.code.material?.value || '') + (parameter_material.code.material?.['规格'] || ''),
            unit: parameter_material.code.material?.['物料单位'] || parameter_material.code.material?.['采购单位'] || '', // 兼容处理，新版都是物料单位
            price: roundNum(parameter_material.code.material?.['price'] || 0,6) * priceRate,
            priceRate:priceRate,
            rmb: RmbMap?.[parameter_material.code.material?.['币种']] || '',
            package_item:{
              item:item.item,
              process:item.process,
              parameter:parameter_material,
            },
            item_data: {
              material: parameter_material.code.material
            },
          };
          priceData.pcs_used=parameter_material.num.value || 0; // PCS用量 = 物料数量
          priceData.order_used=roundNum(priceData.pcs_used * baseForm.quote.pcs_num); // 订单耗量 =   PCS耗量  * 订单PCS总数
          if (priceData.title && priceData.order_used>0){
            costEvent.pushCostItem(priceData);
          }
        }
      }
    });
  },
  // 更新面积附加价格
  updateMJPrice: () => {
    packages_items.value.forEach((item) => {
      const mj_parameters= item.parameters.filter(v=>v.plugin_name===dData.plugin_name.mj_price) || [];
      mj_parameters.forEach(mj_parameter => {
        const priceData={
          ...dData.costItemDefault,
          name:(mj_parameter?.name || '').replace('平米成本','').replace('(未税)',''),
          type:dData.cost_type.TYPE_AREA,
          item_type:mj_parameter.plugin_params?.cost_type || 'bom',
          unit: '平米',
          order_used: baseForm.quote.order_area_gross, // 毛面积
          price: mj_parameter?.value || 0,
          package_item:{
            item:item.item,
            process:item.process,
            parameter:mj_parameter,
          },
        };
        priceData.pcs_used = baseForm.quote.pcs_area_gross;// PCS用量 = pcs毛面积
        priceData.order_used = baseForm.quote.order_area_gross; // 订单耗量=订单毛面积

        if (priceData.price>0 && priceData.order_used>0){
          costEvent.pushCostItem(priceData);
        }
      })
    })
  },

  // 更新订单附加价格
  updateOrderPrice: () => {
    costItems.value.order_ext.list=[];
    packages_items.value.forEach((item) => {
      const order_parameters = item.parameters.filter(v=>v.plugin_name===dData.plugin_name.order_price) || [];
      order_parameters.forEach(order_parameter => {
        const priceData={
          name:'附加费用',
          type:dData.cost_type.TYPE_ORDER,
          item_type:order_parameter.plugin_params?.cost_type || 'bom',
          title:order_parameter?.name || '',
          price: order_parameter?.value || 0,
          package_item:{
            item:item.item,
            process:item.process,
            parameter:order_parameter,
          },
        };
        // 订单附加价格，不计入PCS和面积单价
        priceData.pcs_used = 0; // PCS耗量
        priceData.pcs_price = 0; // PCS成本

        priceData.order_used = 1; // 订单耗量
        priceData.order_price = order_parameter?.value || 0;  //订单金额

        priceData.order_used_overage=1; // 订单耗量(预投)
        priceData.order_price_overage=priceData.order_price; // 订单金额(预投)

        priceData.square_price = 0; // 平米单价(净面积)
        priceData.square_price_gross = 0; // 平米单价(毛面积)
        priceData.square_price_gross_overage = 0; // 平米单价(毛面积/预投)

        if (priceData.price>0 && priceData.order_used>0){
          costEvent.pushCostItem(priceData);
        }
      })
    })
  },
  // 添加成本项
  pushCostItem: (priceData) => {

    if (priceData.pcs_price===null){
      priceData.pcs_price = roundNum(priceData.pcs_used * priceData.price); // PCS成本 = PCS耗量 * 费用单价
    }
    if (priceData.order_price===null){
      priceData.order_price = roundNum(priceData.order_used * priceData.price); // 订单成本 =  订单耗量 * 费用单价
    }

    if (priceData.order_used_overage===null){
      priceData.order_used_overage=roundNum(priceData.pcs_used *  resultBox.data.pcs_num_all); // 订单耗量(预投)  =  PCS耗量  * 订单PCS总数(含预投)
    }
    if(priceData.order_price_overage===null){
      priceData.order_price_overage=roundNum(priceData.order_used_overage * priceData.price); // 订单成本(预投) =  订单耗量(预投) * 费用单价
    }
    if (priceData.square_price===null){
      priceData.square_price = roundNum(priceData.order_price/baseForm.quote.order_area); // 平米成本(净面积) =  订单成本 /  订单净面积
    }
    if (priceData.square_price_gross===null){
      priceData.square_price_gross=roundNum(priceData.order_price/baseForm.quote.order_area_gross); // 平米成本(毛面积) =  订单成本 /  订单毛面积
    }
    if (priceData.square_price_gross_overage===null){
      priceData.square_price_gross_overage=roundNum(priceData.order_price_overage/baseForm.quote.order_area_gross);
      // 平米成本(毛面积/预投) = 订单成本(预投) /  订单毛面积
    }
    costItems.value[priceData.item_type].list.push(priceData);
  },
  updateResult: () => {
    costTable.list=[];
    resultBox.data.pcs_price=0;
    resultBox.data.square_price=0;
    resultBox.data.square_price_gross=0;
    resultBox.data.square_price_gross_overage=0;
    resultBox.data.order_price_overage=0;

    for (const key in costItems.value) {
      costItems.value[key]['pcs_price']=0;
      costItems.value[key]['order_price']=0;
      costItems.value[key]['order_price_overage']=0;

      costItems.value[key]['square_price']=0;
      costItems.value[key]['square_price_gross']=0;
      costItems.value[key]['square_price_gross_overage']=0;

      costItems.value[key].list.map(item=>{
        costItems.value[key]['pcs_price'] += item.pcs_price; // pcs单价分组求和
        costItems.value[key]['order_price'] += item.order_price; // 订单价格分组求和
        costItems.value[key]['order_price_overage'] += item.order_price_overage; // 平米单价含预投分组求和

        costItems.value[key]['square_price'] += item.square_price; // 平米单价分组求和
        costItems.value[key]['square_price_gross'] += item.square_price_gross; // 毛平米单价分组求和
        costItems.value[key]['square_price_gross_overage'] += item.square_price_gross_overage; // 平米价（含预投，毛面积）

        resultBox.data.pcs_price+=item.pcs_price; //纯PCS单价

        resultBox.data.square_price+=item.square_price;  // 净平米成本价
        resultBox.data.square_price_gross+=item.square_price_gross; // 毛平米成本价
        resultBox.data.square_price_gross_overage+=item.square_price_gross_overage; //毛平米成本价(未税，含预投)

        resultBox.data.order_price_overage+=item.order_price_overage;


        costTable.list.push({...item,type_text:dData.optionMap?.[item.type] || item.type});
      })
    }


  /**
   * pcs_price:0,//单PCS成本价(纯成本)
   * pcs_price_overage:0,//单PCS成本价(+预投)
   * pcs_price_all: 0, // PCS单价(预投+税+利润率)
   *
   * square_price:0,//平米成本价(纯成本)
   * square_price_overage:0,//平米成本价(+预投)
   * square_price_all: 0, // 平米价(预投+税+利润率)
   *
   * square_price_gross:0,//毛平米成本价(纯成本)
   * square_price_gross_overage:0,//毛平米成本价(+预投)
   * square_price_gross_all: 0, // 毛平米价(预投+税+利润率)
   *
   * order_price_overage:0,// 订单成本(含预投)
   * order_money: 0, // 订单金额
   * order_money_extra:0, // 额外费用
   * order_money_all: 0,// 订单总金额
   */



    // 单PCS成本价(未税，含预投) = 单PCS成本价(未税) * (1+预投率)
    resultBox.data.pcs_price_overage = resultBox.data.pcs_price * (1+resultBox.data.overage_rate/100);
    // 单PCS成本价(含税，含预投)=单PCS成本价(含税，含利润) * (1+增值税+其他税率) * (1+净利润)
    resultBox.data.pcs_price_all= resultBox.data.pcs_price_overage * (1+resultBox.data.vat_rate/100+resultBox.data.surtax_rate/100);
    // 应报单PCS价(含税,含利润)= 单PCS成本价(含税，含预投) * (1+净利润率)
    resultBox.data.pcs_price_all=resultBox.data.pcs_price_all*(1+resultBox.data.profit_rate/100);

    resultBox.data.pcs_price=_.round(resultBox.data.pcs_price,4);
    resultBox.data.pcs_price_overage=_.round(resultBox.data.pcs_price_overage,4);
    resultBox.data.pcs_price_all=_.round(resultBox.data.pcs_price_all,4);

    // 纯平米成本价(未税，含预投)
    resultBox.data.square_price_overage = resultBox.data.square_price * (1+resultBox.data.overage_rate/100);
    // 纯平米成本价(含税) = 单平米成本价(未税，含预投) * (1+增值税+其他税率)
    resultBox.data.square_price_all=resultBox.data.square_price_overage * (1+resultBox.data.vat_rate/100+resultBox.data.surtax_rate/100);
    // 应报纯平米价(含税,含利润)= 单平米成本价(含税) * (1+净利润率)
    resultBox.data.square_price_all=resultBox.data.square_price_all*(1+resultBox.data.profit_rate/100);

    resultBox.data.square_price=_.round(resultBox.data.square_price,4);
    resultBox.data.square_price_overage=_.round(resultBox.data.square_price_overage,4);
    resultBox.data.square_price_all=_.round(resultBox.data.square_price_all,4);


    //毛单平米成本价(含税) = 毛平米成本价(未税，含预投) * (1+增值税+其他税率)
    resultBox.data.square_price_gross_all=resultBox.data.square_price_gross_overage * (1+resultBox.data.vat_rate/100+resultBox.data.surtax_rate/100);
    // 应报毛平米价(含税,含利润)= 毛单平米成本价(含税) * (1+净利润率)
    resultBox.data.square_price_gross_all=resultBox.data.square_price_gross_all*(1+resultBox.data.profit_rate/100);

    resultBox.data.square_price_gross=_.round(resultBox.data.square_price_gross,4);
    resultBox.data.square_price_gross_overage=_.round(resultBox.data.square_price_gross_overage,4);
    resultBox.data.square_price_gross_all=_.round(resultBox.data.square_price_gross_all,4);



    // 订单金额 = 订单成本(预投) * (1+增值税+其他税率)* (1+净利润率)
    resultBox.data.order_money = resultBox.data.order_price_overage * (1 + (resultBox.data.vat_rate + resultBox.data.surtax_rate) / 100) *
        (1 + resultBox.data.profit_rate / 100);

    resultBox.data.order_money_extra = costItems.value.order_ext.order_price || 0; // 额外成本
    resultBox.data.order_money_all = resultBox.data.order_money + resultBox.data.order_money_extra; //订单金额+额外成本

    resultBox.data.order_money=_.round(resultBox.data.order_money,2);
    resultBox.data.order_money_all=_.round(resultBox.data.order_money_all,2);


    costTableRef.value && costTableRef.value.reportConfig.getData().then(); // 更新表格

  },
  // 折叠
  collapse: (key) => {
    costItems.value[key].collapse = !costItems.value[key].collapse;
  },

}


const costTableRef=ref();
const costTable=reactive({
  isShow: false,
  list:[],
  columns:[],
});

const costTableEvent={
  show: () => {
    const columnFields=[];
    for (let key in dData.costTableColumns) {
      columnFields.push(key+'#'+dData.costTableColumns[key]);
    }
    costTable.columns=listTableFn.createColumns(columnFields, '#');
    costTable.isShow=true;
  },
  close: () => {
    costTable.isShow=false;
  },
  bind: () => {
    return {
      menuConfig: {
        defaultMenuShowList: ['search','moreSettings','pageExport'],
        menu: {
          close: {sort: 9000, title: '关闭表格', icon: 'ri-close-line', click:  costTableEvent.close},
        },
      },
      searchConfig: {
        search: [],
      },
      detailConfig:{colNum:1},
      tableConfig: {
        id:'quote_edit',
        name:'费用明细_'+(baseForm.quote.product_code || baseForm.quote.cust_product_code),
        columns:costTable.columns,
        showCheck: true,
        checkField: 'check',
        disablePage: true,
        useEncryptionFields: false,
        // useUserTableConfig: false,
        get:async ()=>{
          return costTable.list;
        }
      },
      footer:false
    }
  },
}

/**
 * 数字四舍五入
 * @param num 输入数字
 * @param digit1 >min 时的小数位数
 * @param digit2 <=min 时的小数位数
 * @param min 最小值
 * @returns {number}
 */
const roundNum=(num,digit1=0,digit2=6,min=100) => {
  return _.round(num, num > min ? digit1 : digit2)
}


// 结果数据
const resultBox=reactive({
  isError:true, // 是否有错误
  data:{
    pcs_of_pnl: 0, // 1PNL多少PCS

    pcs_num_all: null, // 总pcs数量(订单+预投)
    pnl_num_all: null, // 总PNL数量(订单+预投)
    order_area_all: null, // 总PNL投产面积(订单+预投)

    profit_rate: 0, // 净利润
    vat_rate: 13, // 增值税率
    surtax_rate: 0, // 额外税率

    overage_rate: 0, //真实预投率
    overage_list: [], //预投设置多个
    overage_id: null, //预投率ID
    overage_config: {}, //预投配置

    pcs_price:0,//单PCS成本价(纯成本)
    pcs_price_overage:0,//单PCS成本价(+预投)
    pcs_price_all: 0, // PCS单价(预投+税+利润率)

    square_price:0,//平米成本价(纯成本)
    square_price_overage:0,//平米成本价(+预投)
    square_price_all: 0, // 平米价(预投+税+利润率)

    square_price_gross:0,//毛平米成本价(纯成本)
    square_price_gross_overage:0,//毛平米成本价(+预投)
    square_price_gross_all: 0, // 毛平米价(预投+税+利润率)

    order_price_overage:0,// 订单成本(含预投)
    order_money: 0, // 订单金额
    order_money_extra:0, // 额外费用
    order_money_all: 0,// 订单总金额
  },
});

const resultEvent={
  check: () => {
    const isError = packages_items.value.some((item, index) =>
        item.parameters.some((parameter, parameter_index) => {
          const is_required = parameter.input_options?.required;
          let is_empty;
          if (parameter?.plugin_name === dData.plugin_name.material_code) {
            is_empty = parameter.material_list.length === 0 ||
                parameter.material_list.some(item =>
                        item.num.input_options?.required && (
                            !item.code?.value ||
                            !item.code?.price ||
                            !item.num?.value ||
                            !item.num?.ratio
                        )
                );
          } else {
            is_empty = parameter.value === null || parameter.value === '';
          }
          if (is_required && is_empty) {
            dialog.error(`${index + 1} . ${item.process.name} ${parameter.name} 必填`,10000);
            document.getElementById(`parameter-${index}-${parameter_index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return true;
          }
        })
    );
    resultBox.isError = isError;
    return isError;
  },
  save:async ()=>{
    if (resultEvent.check()) return;
    const cost_sum = {};
    Object.keys(costItems.value).forEach(key => {
      cost_sum[key] = {...costItems.value[key], list: []};
      delete cost_sum[key]['list'];
      delete cost_sum[key]['collapse'];
    });

    const post = {
      id:baseForm.id,
      product_code: baseForm.quote.product_code,
      quote_base:baseForm.quote,
      quote_params:{...baseForm.params,priceRateConfig:materialPriceBox.data},
      packages_items:packages_items.value,
      packages_costs:processBox.costData,
      cost_list:costTable.list,
      cost_sum: cost_sum,
      cost_result:resultBox.data,
    }
    const loading = dialog.loading(undefined, '保存中...');
    const  res = await api.post(api.url2.cost.quote.save,post);
    loading && loading.close();
    if (!res) return;
    dialog.success('保存成功');
  },
  change: (context) => {
    const minValue = Number(context.target.min);
    const maxValue = Number(context.target.max);
    const value = Number(context.target.value);
    // console.log('context',minValue,maxValue,value);
    if (isNaN(value) || value>maxValue || value<minValue){
      dialog.error(`请输入正确的数字: ${minValue} ~ ${maxValue}` );
      context.target.value=0;
      return;
    }
    resultBox.data[context.target.name]=value;
    costEvent.updateAllCost();
  }
}


// 工厂变化，过滤
const plantChange=(value) => {
  vData.select_options= {...dData.selectOptions};
  vData.select_options.packages_base = vData.select_options.package_id.filter(item => item.data.type === dData.package_type.TYPE_BASE && item.data.plant_id === value);
  vData.select_options.packages_service = vData.select_options.package_id.filter(item => item.data.type === dData.package_type.TYPE_SERVICE && item.data.plant_id === value);
  baseForm.params.package_id_base = vData.select_options.packages_base.find(v=>v.value===baseForm.params.package_id_base)?.['value'];
  baseForm.params.package_id_service = vData.select_options.packages_service.filter(v=>v.data.pid===baseForm.params.package_id_base && v.value===baseForm.params.package_id_service)[0]?.value;
};


// 传入报价ID
const idChange =async (value) => {
  if (baseForm.id=== value || !value) return;
  const loading  = dialog.loading(undefined, '加载中...');
  const res = await api.get(apiUrl.cost.quote.get,{id:value});
  loading && loading.close();
  if (!res) return;
  baseForm.quote = res.quote_base;
  baseForm.params = res.quote_params;
  baseForm.id = res.id;
  packages_items.value=[...res?.packages_items];
  processBox.costData=[...res?.packages_costs];
  await baseFormEvent.getOverage();
  costEvent.updateAllCost();
}


watch(() => [props.quote_id, props.quote], async (effects) => {
  const [quote_id, quote] = effects;
  console.log('watch', props, effects);
  if (quote) {
    baseForm.quote = {...quote.quote_base};
    baseForm.params = {...quote.quote_base};
  }else if(quote_id){
    await idChange(quote_id);
  }
}, {immediate: true, deep: true});

onActivated(async () => {
  console.log('onActivated',props);
})

onMounted(async () => {
  console.log('onMounted',props);
  siyi.navHide=true;

  // 初始化配置
  if(!props.FORM_TITLE_MAP?.plant_id_order){
    const res = await  api.get(apiUrl.cost.quote.config);
    dData.optionMap = {...res?.option};
    dData.selectOptions = getOptionsLabel(res?.option);
    dData.FORM_TITLE_MAP = {...res.FORM_TITLE_MAP};
  }

  // 初始化默认工厂
  plantChange(baseForm.quote.plant_id_make);

  // 初始化表单规则
  Object.keys(baseForm.quote).forEach(key => {

    // 非选填字段，增加必填验证规则
    if (!dData.quoteBaseOptionalFields.includes(key)) {
      if (!baseForm.quoteRules.hasOwnProperty(key)) baseForm.quoteRules[key] = [];
      baseForm.quoteRules[key].push({required: true, message: dData.FORM_TITLE_MAP?.[key] + '不能为空', trigger: 'change',});
    }

    // 数字字段，增加数字验证规则
    if (dData.quoteBaseNumberFields.includes(key)){
      baseForm.quoteRules[key].push({number:true, message: dData.FORM_TITLE_MAP[key] + '只能是数字', trigger: 'change',});
      baseForm.quoteRules[key].push({min: 0, message: dData.FORM_TITLE_MAP[key] + '不能小于0', trigger: 'change',});
    }

  });
  Object.keys(baseForm.params).forEach(key => {

    // 非选填字段，增加必填验证规则
    if (!dData.quoteParamsOptionalFields.includes(key)){
      if (!baseForm.paramsRules.hasOwnProperty(key)) baseForm.paramsRules[key] = [];
      baseForm.paramsRules[key].push({required: true,message: dData.FORM_TITLE_MAP[key]+`不能为空`, trigger: 'change',});
    }

    // 数字字段，增加数字验证规则
    if (dData.quoteParamsNumberFields.includes(key)){
      baseForm.paramsRules[key].push({number:true, message: dData.FORM_TITLE_MAP[key] + '只能是数字', trigger: 'change',});
      baseForm.paramsRules[key].push({min: 0, message: dData.FORM_TITLE_MAP[key] + '不能小于0', trigger: 'change',});
    }

  });

  console.log('baseForm',baseForm);



  // 表单初始化
  await baseFormEvent.init();

  // 成本初始化
  costEvent.init();
});


defineExpose({
  editBeforeClose: (context) => {
    console.log('editBeforeClose', context)
  }
})

</script>


<style>
.select-option-center .t-select-option{
  justify-content: center;
  padding-right: 35px;
}
</style>

<style scoped>
.main-body {
  width: 100%;
  height: 100%;
  background-color: #edf0f6;
  display: flex;
  overflow: hidden;
  padding-bottom: 160px;
  flex-direction: row;
  flex-shrink: 0;
  gap: 2px;

    :deep(.t-input__inner){
      text-align: center;
    }

    :deep(.t-radio-group) {
      gap: 5px;
      .t-radio-button {
        border: 1px solid var(--td-border-level-2-color);
        border-radius: 2px;
        margin-bottom: 5px;
        padding: 0 6px;
        min-width: 50px;
        justify-content: center;
      }

      .t-radio-button.t-is-checked {
        border-color: var(--td-brand-color);
      }

      .t-radio-button.t-is-checked::after {
        content: '√';
        position: absolute;
        right: 0;
        bottom: 0;
        width: 14px;
        height: 14px;
        background: linear-gradient(135deg, transparent 50%, #409EFF 50%);
        color: white;
        font-size: 9px;
        font-weight: bold;
        line-height: 1;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        padding-right: 1px;
        padding-bottom: 1px;
        pointer-events: none;
      }
    }

    :deep(.t-check-tag-group) {

      .t-tag {
        margin-bottom: 5px;
      }

      .t-tag.t-tag--checked {
        position: relative;
        overflow: hidden;
      }

      .t-tag.t-tag--checked::after {
        content: '√';
        position: absolute;
        right: 0;
        bottom: 0;
        width: 14px;
        height: 14px;
        background: linear-gradient(135deg, transparent 50%, #409EFF 50%);
        color: white;
        font-size: 9px;
        font-weight: bold;
        line-height: 1;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        padding-right: 1px;
        padding-bottom: 1px;
        pointer-events: none;
      }
    }


    > .form-box {
      width: 22%;
      min-width: 400px;
      max-width: 600px;
      overflow-y: scroll;
      background-color: #fff;
      flex-shrink: 0;
      padding: 5px 10px 60px;

      :deep(.t-form__item){

        .t-form__label{
          padding-right: 15px;
        }

       .t-form__label label {
         display: flex;
         align-items: center;
        }

        i {
          margin-left: auto;
          color: #828282;
          flex-shrink: 0;
          &:hover {
            color: #35a1fd;
          }
        }
      }
    }

    > .process-box{

      background-color: #fff;
      flex: 1;
      overflow: hidden;
      //overflow-y: scroll;
      height: 100%;
      flex-shrink: 0;
      padding-bottom:10px;
      display: flex;
      flex-direction: column;

      > .process-empty {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      > .process-list {

        flex: 1;
        overflow-y: scroll;

        .icon-important{
          color: #FF6600 !important;
        }

        :deep(.t-radio-group) {
          padding: 0 10px;
          margin-right: 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          flex-direction: column;
          line-height: 40px;
        }

        > .process-li {
          border-bottom: 1px dashed #ececec;
          display: flex;
          min-height: 100px;
          flex-direction: column;


          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background-color: #fcfdff;

            > .title  {
              color: #35a1fd;
            }

            > .title > i {
              color: #e5e5e5;

            }

            > .operation > span {
              display: block;
            }
          }

          > .title {
            flex: 1;
            border-right: 1px dashed #ececec;
            font-weight: bold;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
            padding: 10px;
            font-size: 18px;
            background-color: #f5f7f9;


            &:hover {
              color: #35a1fd;
            }

            > em {
              font-size: 12px;
              font-weight: bold;
              flex-shrink: 0;
            }

            > i {
              color: #f1f1f1;
              font-size: 18px;
              position: absolute;
              top: 5px;
              left: 5px;
              margin: 3px;
              &:hover {
                color: #ff2e2e;
              }
            }
          }

          > .content {
            flex: 1;
            display: flex;
            flex-direction: row;
            flex-shrink: 0;
            gap: 0 5px;
            padding: 5px 20px 20px;

            .parameters {
              flex: 1;
              display: flex;
              flex-direction: column;
              flex-shrink: 0;
              margin-bottom: 5px;
              justify-content: center;
              gap: 20px 0;

              .parameter {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;

                :deep(.t-select-input .t-input ){
                  .t-input__suffix:not(:empty){
                    margin: 0;
                    display:none;
                  }
                }
                :deep(.t-input){
                  .t-input__suffix:not(:empty){
                    margin-left: 5px;
                  }
                }

                :deep(.t-input__tips){
                  position: unset;
                }

                .parameter_btn{
                  padding-right: 5px;
                  i {
                    color: #828282;
                    margin: 3px;
                    opacity: 0.5;
                    &:hover {
                      opacity: 1;
                      color: #35a1fd;
                    }
                  }
                }

                &:hover {
                  color: #35a1fd;
                  background-color: #edf2fa;
                }

                .title {
                  min-width: 100px;
                  padding: 0 5px;

                  i {
                    color: #828282;
                    margin: 3px;
                    &:hover {
                      color: #35a1fd;
                    }
                  }
                }

                .content-wrap{
                  display: flex;
                  flex-direction: column;
                  flex: 1;
                  gap:5px;

                  .material-title{
                    text-align: center;
                    padding-top: 5px;
                    div{
                      line-height: 20px;
                    }
                  }
                }

                .content {
                  display: flex;
                  flex: 1;
                  justify-content: flex-end;
                  align-items: center;
                  gap:5px;
                }
                :deep(.t-switch){
                  margin-right: 10px;
                }
              }

            }

            .assets {
              display: flex;
              justify-content: center;
              align-items: flex-start;
              flex-direction: column;
              min-width:150px;
              width:20%;
              :deep(.t-radio-button){
                height: auto;
                padding: 5px 10px;
                display: inline-block;
                width:100%;
                white-space: normal;
                word-break: break-all;
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

      > .process-btn{
        text-align: center;
        line-height: 40px;
        border-top: 1px solid #edf0f6;
      }

      > .process-nav {
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);

        display: flex;
        flex-direction: column;
        justify-content: space-between;

        z-index: 999;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 8px;

        button {
          width: 100%;
          font-size: 20px;
          padding: 0 5px;
        }
      }

    }

    > .cost-box {
      width: 40%;
      min-width: 760px;
      max-width: 1080px;
      overflow: scroll;
      display: flex;
      flex-direction: column;
      gap: 5px;
      flex-shrink: 0;

       .steps {
        height: 100px;
        background-color: #fff;
        overflow-x: scroll;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        flex-shrink: 0;
        position: relative;

        .stepMenu {
          cursor: default;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
           dd {
            width: 18px;
            height: 18px;
            border: 6px solid #c6c9ce;
            border-radius: 50%;
            background-color: #FFF;
            flex-shrink: 0;
          }

          dt {
            line-height: 28px;
            font-size: 14px;
            flex-shrink: 0;
          }

          &.active {
             dd {
              border: 5px solid #35a1fd;
            }

             dt {
              color: #35a1fd;
              font-weight: bold;
            }
          }

          .stepDesc{
            line-height: 16px;
            font-size: 12px;
          }

        }
      }


      > .list {
        padding:10px;
        border-radius: 5px;
        background-color: #fff;
        overflow: hidden auto;
        flex: 1;
        flex-shrink: 0;
        table-layout: fixed; /* 必须 */
        width: 100%;

        td{
          padding: 1px;
          line-height: 24px;
          font-size: 12px;
        }

        .collapse{
          cursor: pointer;
        }

        .cost-items{
          table{
            table-layout: fixed; /* 必须 */
            width: 100%;
          }
        }

        .bom-name{
          width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: center;
        }
        .price-rate{
          font-weight: bold;
        }

        .cost-item-title{
          width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          //text-align: left;
        }

        > div {
          > .title {
            height: 40px;
            line-height: 40px;
            border-bottom: 1px dashed #ededed;
            font-weight: bold;
            padding: 0 5px;
          }
        }


      }

      .cost-table-switcher{
        position: absolute;
        right: 20px;
        top: 20px;
        font-size: 20px;
        cursor: pointer;
        &:hover{
          color: #35a1fd;
        }
      }
    }



  div:hover > .notice-box {
    max-height: 200px;
    opacity: 1;
    transform: translateY(0);
  }

  > .footer-box {
    position: fixed;
    bottom: 0;
    width: 100%;
    border-radius: 5px;
    background-color: #fff;
    z-index: 99999;


    .notice-box{
      text-align: center;
      font-size: 18px;
      line-height: 20px;
      border-bottom: 1px solid #eee;

      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transform: translateY(-4px);
      transition: all .2s ease;

      p{
        line-height: 50px;
      }
    }

    .msg-box{
      display: flex;
      justify-content: center;
      gap: 10px;
    }
    .msg-box :deep(.t-alert) {
      padding: 5px 20px;
      width: 40%;
    }

    .result-box{

      .result-box-row{

        padding-right: 20px;
        overflow: hidden;
        flex-shrink: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;

      > dl {
        display: flex;
        flex-direction: column;
        padding: 0 5px;
        width: 12.5%;

        > dt {
          height: 40px;
          line-height: 40px;
          text-align: center;
          font-size: 16px;
          //font-weight: bold;
          color: #000;
        }

        .number-editor{
          //color: #35a1fd;
        }

        > dd {
          height: 36px;
          line-height: 36px;
          text-align: center;
          font-size: 22px;
          color: #201e1b;
          font-weight: bold;
          flex-direction: row;
          display: flex;
          justify-content: center;
          min-width: 120px;
          word-break: break-all;

          input{
            width: 85px;
            border: none;
            outline: none;
            text-align: right;
            padding-right: 5px;
            background-color: transparent;
            font-weight: bold;
            line-height: 40px;
            font-size: 24px;
            border-bottom: 1px solid #9E9E9E;
            color: #35a1fd;
          }

        }
      }
    }

    }

  }

  .footer-box-ok {
   background-color: #fff;
  }

  .footer-box-error {
    background-color: #eee;
  }

}
</style>
