import React from 'react';
// import { post } from 'axios';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';
import './StudyItem.css'
import { post } from 'axios';

class StudyItem extends React.Component {
    render() {
        return (
            <li className="item_study" >
                <div className="study_background">
                </div>
                <div className="study_desc">
                    <ul className="study_desc_list"> 
                        <li><span className="study_name">{this.props.study_name} - {this.props.study_type}</span></li>
                        <li>모집 인원 : {this.props.num_people} 명</li>
                        <li>현재 인원 : {this.props.current_num_people} 명</li>
                        <li>스터디 기간 : {this.props.study_period} 주</li>
                        <li>스터디 코인 : {this.props.study_coin} 코인</li>
                        <li>스터디 설명: {this.props.study_desc}</li>
                        <CustomerDelete stateRefresh={this.props.stateRefresh} id={this.props.index}/>
                        <CustomerUpdate stateRefresh={this.props.stateRefresh} id={this.props.index}/>
                    </ul>
                </div>
            </li>
        )
    }
}

class CustomerDelete extends React.Component {

    deleteCustomer(id) {
        // RESAPI에서 고객 데이터를 특정 id로 삭제할 때 이렇게 함.
        // /api/customers/7이면 7인 고객을 삭제함.
        const url = '/api/customers/' + id;
        fetch(url, {
            // RESAPI에서 DELETE 방법이 가장 합리적.
            method: 'DELETE'
        }).catch(err => console.log(err));
       this.props.stateRefresh();
    }

    render() {
        return (
            // 지금은 LINK 할 필요 없지만 우선 해놓음. -> 원래 삭제 버튼은 방장의 스터디 커뮤니티에서만 가능해야 함.
            <Link to={'/mainPage'} >
                <button onClick={(e) => {this.deleteCustomer(this.props.id)}}>삭제</button>
            </Link>
        )
    }
}

class CustomerUpdate extends React.Component {
    render() {
        return (
            <Link to={'/renameStudy/'+this.props.id} >
                <span>
                     <button>수정 </button>
                </span>
            </Link>
        )
    }
}

export default StudyItem;