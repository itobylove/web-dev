
import * as api from '@/core/script/api.js'
import dialog from "@/core/script/dialog.js";

export default {
    lt_report_os_po_price: {
        savePrice: async (list, reportTable) => {
            const url = api.url.outwork.order.savePrice;
            const post = list.filter(item => item?.ORDERID && item?.ORDERPRICEREAL).map(({ORDERID, ORDERPRICEREAL}) => ({
                id: String(ORDERID),
                price: Number(ORDERPRICEREAL),
            }));
            if (post.length < 1){
                dialog.error('请选择有价格的数据!');
                return;
            }
            dialog.confirm('确认要保存' + post.length + '条价格数据吗?', async () => {
                const loading = dialog.loading()
                const res = await api.post(url, post);
                loading.close();
                if (res.ok) {
                    dialog.success('保存成功，正在更新数据~');
                    reportTable.getData();
                }
            })
        }
    },
    showMi:async (list, reportTable,jobIdField='jobid',type='open') => {
        const loading = dialog.loading(null,'获取MI数据中...');
        await Promise.all(list.filter((value, index, self) =>
            index === self.findIndex((t) => (t[jobIdField] === value[jobIdField]))
        ).map(async (row)=>{
            await api.getErpPdf('mi',{id:row[jobIdField]},type);
        }))
        loading.close();
    },
};