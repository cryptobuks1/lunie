<template>
  <div class="tx__content">
    <TransactionIcon
      :transaction-group="transaction.group"
      :transaction-type="type"
    />
    <div class="tx__content__left">
      <h3>{{ caption }}</h3>
      <span>name:&nbsp;</span>
      <router-link :to="`/staking/validators/${transaction.value.address}`">{{
        transaction.value.address | formatBech32
      }}</router-link>
    </div>
  </div>
</template>

<script>
import { formatBech32 } from "src/filters"
import TransactionIcon from "../TransactionIcon"

export default {
  name: `unjail-message-details`,
  filters: {
    formatBech32
  },
  components: {
    TransactionIcon
  },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    validators: {
      type: Object,
      required: true
    }
  },
  data: () => {
    return {
      type: `Unjail`,
      caption: `Unjail`
    }
  }
}
</script>
