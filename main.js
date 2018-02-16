//
const l = v => console.log(v)

//
const db = firebase.database()
let refMembers = null
let members = null
let user = null



//
const setSkills = skills => {
    const ranges = document.querySelectorAll("input[type=range]")
    for (range of ranges) {
        for (skill of skills) {
            if (skill.id == range.id.replace("s", "")) {
                //rangeの値更新
                range.value = skill.level
                //横の数字も更新
                document.querySelector(`#${range.id}-value`).innerText = skill.level
            }
        }
    }
}



//
const loginButton = document.querySelector("#login-button")
loginButton.addEventListener("click", async () => {
    //usename取得
    const username = document.querySelector("#username").value
    //チェック
    if (!username) return
    
    //user登録チェック
    refMembers = db.ref("/departments/0/groups/0/members")
    const snapshot = await refMembers.once("value")
    members = snapshot.val()
    for (let member of members) {
        //user情報取得
        if (member.name == username) {
            l(member.skills)
            //template読み込み前だったらエラー
            if (!document.querySelector("#input > div")) {alert("通信エラー！"); return}
            //user取得
            user = member
            //スキルレベルをセット
            setSkills(user.skills)
        }
    }
    
    //新規user生成
    if (!user) {
        //id生成
        const nextId = members.length + 1
        //userオブジェクト生成
        user = {
            "id": nextId,
            "name": username,
            "skills": [{
                "id": "dummy",
                "level": 0
            }]
        }
        //members更新
        members.push(user)
        refMembers.set(members)
    }
    
    //表示切り替え
    document.querySelector("#login").style.display = "none"
    document.querySelector("#input").style.display = "block"
})



//
const createInput = template => {
    //
    const fragment = document.createDocumentFragment()
    //
    for (let category of template.categories) {
        //
        const categoryBlock = document.createElement("div")
        categoryBlock.className = "category-block"
        fragment.appendChild(categoryBlock)
        //
        const categoryName = document.createElement("span")
        categoryBlock.appendChild(categoryName)
        categoryName.innerText = category.name
        
        for (let skill of category.skills) {
            //
            const skillBlock = document.createElement("div")
            skillBlock.className = "skill-block"
            //
            const skillName = document.createElement("span")
            skillBlock.appendChild(skillName)
            skillName.innerText = skill.name
            //
            const range = document.createElement("input")
            skillBlock.appendChild(range)
            range.id = `s${skill.id}`
            range.setAttribute("type", "range")
            range.setAttribute("value", 0)
            range.setAttribute("min", 0)
            range.setAttribute("max", 5)
            //スライダー変更時イベント
            range.addEventListener("change", () => {
                //表示値更新
                document.querySelector(`#s${skill.id}-value`).innerText = range.value
                
                //項目更新
                let flag = false
                for (userSkill of user.skills) {
                    if (userSkill.id == skill.id) {
                        userSkill.level = range.value
                        flag = true
                    }
                }
                //項目が無かった場合
                if (!flag) {
                    const newSkill = {
                        "id": skill.id,
                        "level": range.value
                    }
                    user.skills.push(newSkill)
                }
                
                //DB更新
                for (member of members) {
                    if (member.id == user.id) {
                        member = user
                    }
                }
                refMembers.set(members)
                
            })
            //
            const rangeValue = document.createElement("span")
            skillBlock.appendChild(rangeValue)
            rangeValue.id = `s${skill.id}-value`
            rangeValue.innerText = 0
            //
            categoryBlock.appendChild(skillBlock)
        }
    }
    //
    document.querySelector("#input").appendChild(fragment)
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//
const main = async () => {
    const snapshot = await db.ref("/template").once("value")
    const template = snapshot.val()
    createInput(template)
}
main()
