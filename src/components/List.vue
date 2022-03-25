<template>
  <div class="Pcontent">   
    <div class="list_head">
      <a href="#/" class="logo"><span class="lg"></span></a>
      <span class="h_title" v-if="tab_type == '10001'">我的图片</span>
      <span class="h_title" v-if="tab_type == '10003'">我的背景</span>
      <span class="h_title" v-if="tab_type == '10004'">我的音乐</span>
    </div>
    <div class="list_content">
        <div class="piclist" ref='piclist' v-if="tab_type == '10001' || tab_type == '10003'"> 
          <ul class="list_ul">
            <li v-for="(item,index) in list" :key="index">
              <!-- <i class="van-icon van-icon-clear del_img" @click="delpic(item.type,index)"></i> //删除按钮 -->
              <img :src="resHost+item.src+'?100x100'">
            </li>            
          </ul>
          <div v-if="loading" class="loading" style="clear:both">
            <van-loading type="spinner"/> 加载中
          </div>
          <div v-if="fanished" class="fanished" style="clear:both">已全部加载完成</div>
        </div> 
    </div>
    

    <div class="list_bottom">
      <div class="van-uploader">
        <div class="van-uploader__wrapper">
          <div class="van-uploader__input-wrapper" v-if="tab_type == '10001'">
            <div class="upbtn"><i class="van-icon van-icon-photo van-button__icon"></i> 上传图片</div>
            <input type="file" accept="image/*" ref="file" @change="afterRead($event)" class="van-uploader__input">
          </div>
          <div class="van-uploader__input-wrapper" v-if="tab_type == '10003'">
            <div class="upbtn"><i class="van-icon van-icon-photo van-button__icon"></i> 上传背景</div>
            <input type="file" accept="image/*" ref="file" @change="afterRead($event)" class="van-uploader__input">
          </div>
          <div class="van-uploader__input-wrapper" v-if="tab_type == '10004'">
            <div class="upbtn"><i class="van-icon van-icon-music van-button__icon"></i> 上传音乐</div>
            <input type="file" accept="audio/*" ref="file" @change="afterRead($event)" class="van-uploader__input">
          </div>
        </div>
      </div>

      <!-- <van-uploader :after-read="afterRead">        
        <div class="upbtn"><i class="van-icon van-icon-photo van-button__icon" ></i> {{uploadTitle}}</div>        
      </van-uploader> -->
    </div>
    
  </div>
</template>



<script>
import { Uploader,Loading,Notify,Dialog,Toast  } from 'vant';
import '@/assets/css/list.css' 
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  components: {
    // 'vanList':List,    
    // 'vanUploader':Uploader,
    'vanLoading':Loading
  },
  data() {
    return {
      loading:false, 
      fanished:false,    
      pageIndex: 1,
      pageSize: 36,      
      list: [],
      token:null,
      tab_type:'10001',
      uploadTitle:'上传图片',
      resHost:config.resHost
    };
  },

  methods: {
    //删除图片
    delpic(el,index){
      var s=this
      console.log(el,index)       
      Dialog.confirm({
        title: '温馨提示',
        message: '您确定要删除这张图片吗'
      }).then(() => {
        // on confirm
        s.list.splice(index,1); 
      }).catch(() => {
        // on cancel
      });
    },

    // 上传图片
    afterRead(e){
      var s=this
      let file = e.target.files[0];  
      if(file.type != 'audio/mp3' && s.tab_type=='10004'){
        Notify({ type: 'warning', message: '请上传mp3格式的音乐文件' });
        return
      }
      Toast.loading({
        message: '上传中',
        duration:200000
      });
          
      let param = new FormData() // 创建form对象
      param.append('file', file)
      param.append('type', s.tab_type)
      param.append('id', config.id)// 添加form表单中其他数据    
      param.append('token', s.token)// 上传token
      param.append('zip', 1)// 0不压缩  1压缩
      
      // console.log(param)
      s.$axios.post(config.apiHost+'/user/uploadResItem',param,{withCredentials: true,crossDomain: true}).then(res => { 
        if(res.data.code==200){          
          Toast.success('上传成功');
          // console.log(res.data.data)
          var addimg = {
            filename: 'img',
            id: res.data.data.id,
            src: res.data.data.url,
            type: 'img'
          }
          this.list.unshift(addimg); 
        }else{    
          // alert(res.data.msg)      
          Notify({ type: 'warning', message: res.data.msg });
          Toast.clear();
        }
        s.$refs.file.value = null        
      })
      .catch(err => {
        Notify({ type: 'warning', message: err });
        s.$refs.file.value = null   
        Toast.clear();        
      });  
    },



    // 获取图片数据
    getpic(type){
      var s=this   
      // console.log(type)
      s.loading=true
      
      var id=s.list.length>0 ? s.list[s.list.length-1].id :0
      // console.log(id)   
      s.$axios.post(config.apiHost+'/user/resList',{
        last:id,
        id:config.id,
        type:type,
        token:s.token        
      },{withCredentials: true,crossDomain: true}).then(res => {
        if(res.data.code==200){
          // console.log(res.data.data)           
          if (res.data.data.length > 0) {     
            s.loading=false               
            this.list = [...this.list, ...res.data.data]
          } else {
            s.loading=false
            this.fanished = true
          }          
        }else if(res.data.code==201){
          s.loading=false
          this.fanished = true
        }else{          
          Notify({ type: 'warning', message: res.data.msg });
        }        
      })
      .catch(err => {
        alert(err)
        Notify({ type: 'warning', message: '服务器繁忙，请稍后再试！' });
      });  
    },

    //滚动加载
    scrollMoreData() {
      let s=this
      s.box=s.$refs.piclist
      s.box.addEventListener('scroll', ()=>{
        const scrollTop = s.box.scrollTop  //滚动高度
        const clientHeight = s.box.clientHeight //滚动区域高度      
        const scrollHeight = s.box.scrollHeight  //滚动区域高度
        // console.log(scrollTop, clientHeight, scrollHeight)
        if (clientHeight >= scrollHeight-scrollTop - 10) {            
            this.pageIndex = this.pageIndex += 1 
            s.$nextTick(()=>{
              if(this.fanished==false){
                s.getpic(config.type);
              }
              
            })            
        }
      })      
    },    
    getUrlKey(name) {
      return (
        decodeURIComponent(
          (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(
            location.href
          ) || [, ''])[1].replace(/\+/g, '%20')
        ) || null
      );
    },

  },
  created(){
    var s=this
    s.$nextTick(()=>{
      s.scrollMoreData()
    })
    
    // console.log(Velocity)
    
  },
  mounted() {
    var s=this    
    var type=config.type
    s.tab_type=type;
    s.$axios.post(window.location.protocol+"//"+window.location.host+"/user/getToken",{        
        id:config.id      
      },{withCredentials: true,crossDomain: true}).then(res => {
        if (res.data.code === 200) {
          console.log(res.data.data.token)
          s.token=res.data.data.token
          s.$nextTick(()=>{
            s.getpic(type)
          })
        } else {
          console.log(res.data.msg)
        }
        
      })
    
    // console.log(config)
    
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
