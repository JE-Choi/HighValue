import React, { Component } from 'react';
import './StudyInfo.css';
import { post } from 'axios';
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

// 블록체인
import getWeb3 from "../utils/getWeb3";
import StudyGroup from "../contracts/StudyGroup.json"; 


class StudyInfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            // 스터디 가입 테이블 삽입시 사용
            study_id: 0 ,
            leader_name:'',
            person_id: '',
            leader: 0,
            account_number: '',
            joinStudy: 1,
            JoinShowBtn: 0,

            // 스터디 정보 불러올 때 사용
            study_name: '' ,
            study_type: '',
            num_people: '',
            current_num_people: '',
            study_coin: '',
            study_period: '',
            study_desc: '',

            // 블록체인
            studyGroupInstance:null,
            myAccount: null,
            web3: null,
            account_pw:''
        }
    }

    // handleFormSubmit = (e) => {
    //     // data가 서버로 전달될 때 오류 발생하지 않도록 함수로 불러옴.
    //     e.preventDefault(); 
    
    //     this.callJoinApi().then((response) => {
    //         console.log(response.data);
    //     });
    // }

    componentDidMount() {
        this.callApi()
          .then(res => {
              //this.setState({study_item_info: res});
              this.setState ({
                study_name: res[0].study_name ,
                study_type: res[0].study_type,
                num_people: res[0].num_people,
                current_num_people: res[0].current_num_people,
                study_period: res[0].study_period,
                study_coin: res[0].study_coin,
                study_desc: res[0].study_desc
            });

        }).catch(err => console.log(err));

        this.callLeaderApi().then(res => {
            this.setState ({
                leader_name: res[0].person_name
            })
        })

        this.getSession();

        // 로그인하지 않은 상태, 스터디 가입하지 않은 사람이면 가입하기 버튼을 보이지 않게 함.
        setTimeout(() => {
            if(sessionStorage.getItem("loginInfo") == null){  
                this.setState({joinStudy: 1});
            }else{
                this.joinStudy();
            }
        }, 50);        
    }

    getSession = () => {
        if (typeof(Storage) !== "undefined") {
            this.setState({person_id: sessionStorage.getItem("loginInfo")});
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    callApi = async () => {
        const response = await fetch('/api/studyItems/view/' + this.props.match.params.id);
        const body = await response.json();
        return body;
    }

    callLeaderApi = async () => {
        const response = await fetch('/api/studyItems/view_leader/' + this.props.match.params.id);
        const body = await response.json();
        return body;
    }

    callJoinApi = () => {
        const url = '/api/studyItems/join/' + this.props.match.params.id;
        post(url,  {
            study_id: this.props.match.params.id,
            person_id: this.state.person_id,
            leader: false,
            account_number: '11-22'
        }).then(()=>{
            let account_id = this.createAccount();
            this.transferCoin(account_id);
            this.props.history.push('/mainPage'); 

            setTimeout(()=>{
                this.studyOkJoinConfirm();
            },100);
        })
    }

    // 스터디 가입 확인창
    studyJoinConfirm = () => {
        confirmAlert({
          title: '스터디 가입',
          message: '스터디를 가입하시겠습니까?',
          buttons: [
            {
                label: '네',
                onClick: () => this.callJoinApi()
            },
            {
                label: '아니요',
                onClick: () => this.studyNoJoinConfirmOK()
            }
          ]
        })
    };

    // 스터디 가입 완료 확인창
    studyOkJoinConfirm = () => {
        confirmAlert({
            title: '스터디에 가입되셨습니다.',
            message: '자세한 사항은 MyPage에서 확인 가능합니다.',
            buttons: [
                {
                    label: '확인'
                }
            ]
        })
    }

    // 스터디 가입 취소 확인창
    studyNoJoinConfirm = () => {
        confirmAlert({
            title: '스터디 가입을 취소했습니다.',
            buttons: [
                {
                    label: '확인'
                }
              ]
        })
    }

    // 스터디 가입 취소 확인 메소드를 호출하는 메소드
    studyNoJoinConfirmOK = () => {
        setTimeout(()=>{
            this.studyNoJoinConfirm();
        },100);
    }

    // 스터디 가입했는지 확인 쿼리
    joinStudy = () =>{
        const url = '/api/isCheckJoinAndLeader';
        post(url,  {
            study_id: this.props.match.params.id,
            person_id: this.state.person_id
        }).then((result)=>{
            this.setState({joinStudy:result.data.length});
            setTimeout(() => {

                if(result.data.length === 1) {
                    this.isStudyLeader(result.data[0].leader);
                } else{
                    this.isStudyLeader(0);
                }
            }, 100);
        });
    }

    // 해당 study의 방장인지 확인 쿼리
    isStudyLeader = (_leader) =>{
        this.setState({leader:_leader});
    }

    // 방장이 study 삭제하는 메소드
    deleteCustomer(_id) {
        const url = '/api/studyItems/' + _id;
        fetch(url, {
            method: 'DELETE'
        }).catch(err => console.log(err));
    }

    createAccount(){
        const { shopInstance, myAccount, web3} = this.state; 
       
        // (예정) 계정 생성 전에 DB에 접근하여 중복되는 비밀번호 있는지 검사하고나서, 중복되는 게 없는 경우에만 회원가입 진행
        
        // 계정 생성 
        //var account_pw = this.state.account_pw;
        let account_pw = prompt("코인지갑 비밀번호를 입력해주세요.");
        web3.eth.personal.newAccount(account_pw);
        console.log('사용된 패스워드: ' + account_pw);
    
        // (예정) 생성된 계좌의 잔액은 0Ether이다. 충전하는 부분 만들어야 한다.
        // 있는 계정들 모두 출력

        // 마지막에 생성된 계정 index구하기
            var account_id =  myAccount.length - 1;
            console.log(account_id);
    
        // DB 저장 시 계정 index값과 비밀번호, hash계정 값 저장해야함.
        var account_num = myAccount[account_id];
        console.log('['+(account_id)+'] 번째 인덱스에 '+ account_num +'계정이 생겨났고, 비밀번호는 ' + account_pw);
    
        
        // DB에 값 삽입
        this.callCreateAccountApi(this.state.person_id, account_id, account_num, account_pw).then((response) => {
            //console.log(response.data);
            console.log(this.state.person_id +' '+account_id+' '+account_num+' '+account_pw);
        }).catch((error)=>{
        console.log(error);
        });

        return account_id;
        
    
        // this.createTheStudy(0,account_num, 'person', 1, 40);
        
    }

    callCreateAccountApi = (_person_id,_account_id,_account_num,_account_pw) => {
        const url = '/api/createAccount';
        return post(url,  {
            person_id: _person_id,
            account_id: _account_id,
            account_num: _account_num,
            account_pw: _account_pw
        });
    }

    transferCoin(_account_id){
        const { studyGroupInstance, myAccount, web3} = this.state; 

        let study_make_coin = this.state.study_coin;
        // myAccount[_account_id] <- 이 계좌가 받는 사람 계좌.
        studyGroupInstance.methods.transferCoin(myAccount[_account_id]).send(
          {
            from: myAccount[0], 
            value: web3.utils.toWei(String(study_make_coin), 'ether'),
            // gasLimit 오류 안나서 일단은 gas:0 으로 했지만 오류 나면 3000000로 바꾸기
            gas: 0 
          }
        );
        setTimeout(function(){
            web3.eth.getBalance(myAccount[_account_id]).then(result=>{
                console.log('이체 후 잔액은: ' + web3.utils.fromWei(result, 'ether'));
            });
            }, 1000);



    }

    componentWillMount = async () => {
        try {
          // Get network provider and web3 instance.
          const web3 = await getWeb3();

          // Use web3 to get the user's accounts.
          const myAccount = await web3.eth.getAccounts();

          // Get the contract instance.
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = StudyGroup.networks[networkId];
          const instance = new web3.eth.Contract(
            StudyGroup.abi,
            deployedNetwork && deployedNetwork.address
          );


          // // 확인용 로그
          // console.log(ShopContract.abi);
          console.log(web3);
          console.log(myAccount);

        //   Set web3, accounts, and contract to the state, and then proceed with an
        //   example of interacting with the contract's methods.
        this.setState({ web3, myAccount, studyGroupInstance: instance});

        } catch (error) {
          alert(
            `Failed to load web3, accounts, or contract. Check console for details.`,
          );
          console.error(error);
        }


      };

    render() {
        
        // 로그인, 스터디 가입 여부
        var isJoinBtnShow = {
            display: this.state.joinStudy == 1 ? "none" : "inline"
        };

        // 방장의 study 수정 버튼 가시화
        var isModifyBtnShow = {
            display: this.state.leader == 0 ? "none" : "inline"
        };

        // 방장의 study 삭제 버튼 가시화
        var isDeleteBtnShow = {
            display: this.state.leader == 0 ? "none" : "inline"
        };

        return (
            <div>
                <div className="main_studyInfo">
                    <div style={{marginTop: 10}} className = "studyInfo_container">
                        <div className="studyInfo_left">
                            <div className="studyInfo_header_div">
                                <span className="studyInfo_header" id="studyInfo_title">{this.state.study_name}</span>
                                <span className="studyInfo_header"> - </span>
                                <span className="studyInfo_header" id="studyInfo_kinds">{this.state.study_type}</span>
                            </div>
                            <div className="studyInfo_left_bottom">
                                <div className="studyInfo_content">
                                    {this.state.study_desc}
                                </div>
                                <div className = "studyInfo_list_div">
                                    <ul className="studyInfo_list">
                                        <li>방장 : {this.state.leader_name}</li>  
                                        <li>코인: {this.state.study_coin}</li>
                                        <li>모집 인원 : {this.state.num_people}</li>
                                        <li>현재 인원 : {this.state.current_num_people}</li>
                                        <li>Study 기간 : {this.state.study_period} 주</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="studyInfo_btn">
                            <Link to={'/mainPage'}>
                                <input type="button" value="뒤로가기" className="btn btn-danger" id="study_info_back"/>
                            </Link>
                            <input type="button" style = {isJoinBtnShow} value="가입하기" className="btn btn-danger" id="study_info_join" name='study_info_join' onClick={this.studyJoinConfirm} />
                            <Link to={'/renameStudy/' + this.props.match.params.id}>
                                <input type="button" style = {isModifyBtnShow} value="수정하기" className="btn btn-danger" id="study_info_modify"/>
                            </Link>
                            <Link to={'/mainPage'}>
                                <input type="button" style = {isDeleteBtnShow} value="삭제하기" className="btn btn-danger" id="study_info_delete" onClick={(e) => {this.deleteCustomer(this.props.match.params.id)}}/>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default StudyInfo;