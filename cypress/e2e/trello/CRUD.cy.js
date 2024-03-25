/// <reference types="Cypress" />

describe("Trello", () => {
    it("Create Board", () => {
        cy.request({
            url: `https://api.trello.com/1/organizations/${Cypress.env("organizationName")}?&key=${Cypress.env("key")}&token=${Cypress.env("token")}`,
            method: "GET"
        }).as("GetIdBoard").then((resp) => {
            cy.writeFile("cypress\\fixtures\\organizationId.json", resp)
            
            // Criar Board
            cy.fixture('organizationId.json').then((jsonData) => {
                if(jsonData.body.displayName == Cypress.env("organizationDisplayName")) {
                    cy.request({
                        url: `https://api.trello.com/1/boards/?idOrganization=${jsonData.body.id}&name=${Cypress.env("boardName")}&key=${Cypress.env("key")}&token=${Cypress.env("token")}`,
                        method: "POST"
                    }).then((resp) => {
                        expect(resp.status).to.eq(200)
                    })
                } else {
                    throw new Error("Área de Trabalho não encontrada!")
                }
            })
        })
    })
    
    it("Create Card", () => {
        cy.fixture('organizationId.json').then((jsonDataOrganization) => {
            // Obter ID do Board
            cy.request({
                url: `https://api.trello.com/1/organizations/${jsonDataOrganization.body.id}/boards?key=${Cypress.env("key")}&token=${Cypress.env("token")}`,
                method: "GET"
            }).as("GetIdBoard").then((resp) => {
                cy.writeFile("cypress\\fixtures\\boardId.json", resp)
                            
                // Criar lista usando o ID obtido na resposta da requisição
                cy.fixture('boardId.json').then((jsonDataBoard) => {
                    cy.request({
                        url: `https://api.trello.com/1/lists?name=${Cypress.env("listName")}&idBoard=${jsonDataBoard.body[0].id}&key=${Cypress.env("key")}&token=${Cypress.env("token")}`,
                        method: "POST"
                    }).as("CreateList").then((resp) => {
                        expect(resp.status).to.eq(200)
                    })
            
                    // Obter ID da Lista      
                    cy.request({
                        url: `https://api.trello.com/1/boards/${jsonDataBoard.body[0].id}/lists?key=${Cypress.env("key")}&token=${Cypress.env("token")}`,
                        method: "GET"
                    }).as("GetListsOnABoard").then((resp) => {
                        expect(resp.status).to.eq(200)
                        cy.writeFile("cypress\\fixtures\\listId.json", resp)
            
                        // Criar card usando o ID obtido na resposta da requisição
                        cy.fixture('listId.json').then((jsonDataList) => {
                            cy.request({
                                url: `https://api.trello.com/1/cards?idList=${jsonDataList.body[0].id}&key=${Cypress.env("key")}&token=${Cypress.env("token")}&name=${Cypress.env("cardName")}`,
                                method: "POST"
                            }).as("CreateCard").then((resp) => {
                                expect(resp.status).to.eq(200)
                            })
                        })
                    })
                })
            })
        })
    })

    it("Delete Card", () => {
        // Obter ID do Board
        cy.fixture('boardId.json').then((jsonDataBoard) => {
            
            // Obter ID do Card
            cy.request({
                url: `https://api.trello.com/1/boards/${jsonDataBoard.body[0].id}/cards?key=${Cypress.env("key")}&token=${Cypress.env("token")}`,
                method: "GET"
            }).as("GetCardsOnABoard").then((resp) => {
                expect(resp.status).to.eq(200)
                cy.writeFile("cypress\\fixtures\\cardId.json", resp)
    
                cy.fixture('cardId.json').then((jsonDataCard) => {
                    // Deletar card usando o ID obtido na resposta da requisição
                    cy.request({
                        url: `https://api.trello.com/1/cards/${jsonDataCard.body[0].id}?key=${Cypress.env("key")}&token=${Cypress.env("token")}`,
                        method: "DELETE"
                    }).as("DeleteCard").then((resp) => {
                        expect(resp.status).to.eq(200)
                    })
                })
            })
        })
    })

    it("Delete Board", () => {
        // Obter ID do Board
        cy.fixture('boardId.json').then((jsonDataBoard) => {
            // Deletar o Board
            cy.request({
                url: `https://api.trello.com/1/boards/${jsonDataBoard.body[0].id}?key=${Cypress.env("key")}&token=${Cypress.env("token")}`,
                method: "DELETE"
            }).as("DeleteBoard").then((resp) => {
                expect(resp.status).to.eq(200)
            })
        })
    })
})