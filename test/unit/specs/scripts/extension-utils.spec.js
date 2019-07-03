import {
  listenToExtensionMessages,
  processLunieExtensionMessages,
  getAccounts,
  signWithExtension
} from "scripts/extension-utils.js"

describe(`Extension Utils`, () => {
  describe("listenToExtensionMessages", () => {
    let store

    beforeEach(() => {
      store = {
        commit: jest.fn(),
        dispatch: jest.fn()
      }
    })

    it("listens for extension messages", () => {
      const spy = jest.spyOn(global, "addEventListener")
      listenToExtensionMessages(store)
      expect(spy).toHaveBeenCalledWith("message", expect.any(Function))
    })

    it("should signal that the extension is enabled", () => {
      processLunieExtensionMessages(store)({
        source: global,
        data: {
          type: "FROM_LUNIE_EXTENSION",
          message: {
            type: "INIT_EXTENSION"
          }
        }
      })

      expect(store.commit).toHaveBeenCalledWith("setExtensionAvailable")
      expect(store.dispatch).toHaveBeenCalledWith("getAddressesFromExtension")
    })

    it("should ignore messages not from the extension", () => {
      processLunieExtensionMessages(store)({
        source: global,
        data: {
          type: "NOT_FROM_LUNIE_EXTENSION",
          message: {
            type: "INIT_EXTENSION"
          }
        }
      })

      expect(store.commit).not.toHaveBeenCalledWith("setExtensionAvailable")
    })

    it("should react to query wallet responsesn", () => {
      processLunieExtensionMessages(store)({
        source: global,
        data: {
          type: "FROM_LUNIE_EXTENSION",
          message: {
            type: "GET_WALLETS_RESPONSE",
            payload: [
              {
                address: "cosmos1234",
                name: "TEST_ADDRESS"
              }
            ]
          }
        }
      })

      expect(store.commit).toHaveBeenCalledWith("setExtensionAccounts", [
        {
          address: "cosmos1234",
          name: "TEST_ADDRESS"
        }
      ])
    })
  })

  describe("messages", () => {
    beforeEach(() => {
      jest.spyOn(global, "postMessage")
      global.postMessage.mockClear()
    })
    afterAll(() => {
      global.postMessage.mockReset()
    })

    it("should request wallets", async () => {
      global.postMessage.mockClear()

      getAccounts()
      expect(global.postMessage.mock.calls).toEqual([
        [
          {
            payload: { type: "GET_WALLETS" },
            skipResponse: false,
            type: "FROM_LUNIE_IO"
          },
          "*"
        ]
      ])
    })

    describe("sign", () => {
      beforeEach(() => {
        jest
          .spyOn(global, "addEventListener")
          .mockImplementation((type, callback) => {
            callback({
              signature: "abcd",
              publicKey: "1234"
            })
          })
        global.postMessage.mockClear()
      })

      afterAll(() => {
        global.addEventListener.mockReset()
      })

      it("should request a signature", () => {
        signWithExtension("abc", "cosmos1234")
        expect(global.postMessage.mock.calls).toEqual([
          [
            {
              payload: {
                payload: {
                  senderAddress: "cosmos1234",
                  signMessage: "abc"
                },
                type: "LUNIE_SIGN_REQUEST"
              },
              skipResponse: false,
              type: "FROM_LUNIE_IO"
            },
            "*"
          ]
        ])
      })

      it("should react to signature approval", () => {
        global.addEventListener.mockImplementation((type, callback) => {
          callback({
            rejected: true
          })
        })
        expect(signWithExtension("abc")).rejects.toThrow(
          "User rejected action in extension."
        )
      })

      it("should react to signature disapproval", async () => {
        const result = await signWithExtension("abc")
        expect(result).toEqual({
          signature: expect.any(Buffer),
          publicKey: expect.any(Buffer)
        })
      })
    })
  })
})